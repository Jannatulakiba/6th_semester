import 'live_reading.dart';

enum ReportLevel { reassuring, caution, urgent, incomplete }

class ReportMetric {
  const ReportMetric({
    required this.value,
    required this.label,
    required this.detail,
  });

  final String value;
  final String label;
  final String detail;
}

class WellnessTip {
  const WellnessTip({
    required this.title,
    required this.detail,
    required this.iconName,
  });

  final String title;
  final String detail;
  final String iconName;
}

class WellnessReport {
  const WellnessReport({
    required this.level,
    required this.title,
    required this.summary,
    required this.nextStep,
    required this.heartRate,
    required this.oxygen,
    required this.skinChange,
    required this.sensorChecks,
    required this.skinResponse,
    required this.skinResponseDetail,
    required this.heartSignal,
    required this.heartSignalDetail,
    required this.tips,
  });

  final ReportLevel level;
  final String title;
  final String summary;
  final String nextStep;
  final ReportMetric heartRate;
  final ReportMetric oxygen;
  final ReportMetric skinChange;
  final ReportMetric sensorChecks;
  final String skinResponse;
  final String skinResponseDetail;
  final String heartSignal;
  final String heartSignalDetail;
  final List<WellnessTip> tips;

  factory WellnessReport.fromReading(LiveReading reading) {
    final pulseSignal = _signalState(reading.max30102Quality);
    final skinSignal = _signalState(reading.gsrQuality);
    final ecgSignal = _signalState(reading.ecgQuality);
    final pulseUsable =
        reading.fingerDetected &&
        pulseSignal != _SignalState.poor &&
        pulseSignal != _SignalState.unknown;

    final heartRate = _heartRateResult(reading, pulseUsable);
    final oxygen = _oxygenResult(reading, pulseUsable);
    final skinResult = _skinResult(reading, skinSignal);
    final heartSignal = _heartSignalResult(ecgSignal);
    final skinChange = _skinChangeResult(reading, skinSignal);
    final sensorChecks = _sensorChecksResult(
      pulseUsable: pulseUsable,
      skinSignal: skinSignal,
      ecgSignal: ecgSignal,
    );
    final serverStatus = reading.status.trim().toLowerCase();
    final serverAlert =
        serverStatus.contains('warning') ||
        serverStatus.contains('abnormal') ||
        serverStatus.contains('critical') ||
        serverStatus.contains('danger') ||
        serverStatus.contains('alert');
    final oxygenUrgent =
        pulseUsable && reading.spo2 != null && reading.spo2! <= 92;
    final vitalCaution =
        pulseUsable &&
        (_outsideRestingHeartRate(reading.heartRate) ||
            (reading.spo2 != null && reading.spo2! < 95));
    final poorContact =
        pulseSignal == _SignalState.poor ||
        skinSignal == _SignalState.poor ||
        ecgSignal == _SignalState.poor;
    final missingVitals =
        !pulseUsable || reading.heartRate == null || reading.spo2 == null;

    late final ReportLevel level;
    late final String title;
    late final String summary;
    late final String nextStep;

    if (oxygenUrgent) {
      level = ReportLevel.urgent;
      title = 'Low oxygen reading';
      summary =
          'The experimental oxygen reading is below the usual range for most adults.';
      nextStep =
          'Sit still and repeat it now. If it stays at 92% or lower, or you feel short of breath or very unwell, seek urgent medical help.';
    } else if (serverAlert || vitalCaution) {
      level = ReportLevel.caution;
      title = 'Please check this reading';
      summary =
          'One or more results are outside the usual resting range for most adults.';
      nextStep =
          'Rest quietly for five minutes and repeat the reading. Contact a healthcare professional if it remains unusual or you feel unwell.';
    } else if (poorContact || missingVitals) {
      level = ReportLevel.incomplete;
      title = 'Reading incomplete';
      summary =
          'The app needs a clearer sensor reading before showing a result.';
      nextStep =
          'Place your finger fully on the sensor, keep your hand warm and still, then try again.';
    } else {
      level = ReportLevel.reassuring;
      title = 'Readings look steady';
      summary =
          'The available measurements are within the app’s expected wellness ranges.';
      nextStep =
          'No action is suggested by this reading. Keep monitoring how you feel.';
    }

    return WellnessReport(
      level: level,
      title: title,
      summary: summary,
      nextStep: nextStep,
      heartRate: heartRate,
      oxygen: oxygen,
      skinChange: skinChange,
      sensorChecks: sensorChecks,
      skinResponse: skinResult.$1,
      skinResponseDetail: skinResult.$2,
      heartSignal: heartSignal.$1,
      heartSignalDetail: heartSignal.$2,
      tips: _tipsFor(
        level: level,
        pulseUsable: pulseUsable,
        heartRate: reading.heartRate,
        oxygen: reading.spo2,
        skinChanged: reading.gsrChange.abs() > 0.2,
      ),
    );
  }

  static ReportMetric _skinChangeResult(
    LiveReading reading,
    _SignalState signal,
  ) {
    if (signal == _SignalState.poor || signal == _SignalState.unknown) {
      return const ReportMetric(
        value: '--',
        label: 'Not available',
        detail: 'A stable skin-sensor contact is needed.',
      );
    }

    final percentage = reading.gsrBaseline.abs() > 0.001
        ? (reading.gsrChange / reading.gsrBaseline) * 100
        : 0.0;
    final prefix = percentage > 0 ? '+' : '';
    return ReportMetric(
      value: '$prefix${percentage.toStringAsFixed(1)}%',
      label: percentage.abs() <= 5 ? 'Close to baseline' : 'Changed',
      detail: 'Change compared with your recent sensor baseline.',
    );
  }

  static ReportMetric _sensorChecksResult({
    required bool pulseUsable,
    required _SignalState skinSignal,
    required _SignalState ecgSignal,
  }) {
    final ready = [
      pulseUsable,
      skinSignal == _SignalState.good || skinSignal == _SignalState.fair,
      ecgSignal == _SignalState.good || ecgSignal == _SignalState.fair,
    ].where((value) => value).length;
    return ReportMetric(
      value: '$ready/3',
      label: ready == 3 ? 'All ready' : 'Needs attention',
      detail: 'Finger, skin, and heart-sensor checks.',
    );
  }

  static ReportMetric _heartRateResult(LiveReading reading, bool pulseUsable) {
    if (!pulseUsable || reading.heartRate == null) {
      return const ReportMetric(
        value: '--',
        label: 'Not available',
        detail: 'Keep your finger still on the sensor.',
      );
    }

    final rate = reading.heartRate!;
    if (rate >= 60 && rate <= 100) {
      return ReportMetric(
        value: '${rate.toStringAsFixed(0)} bpm',
        label: 'Usual resting range',
        detail: 'For most adults resting calmly.',
      );
    }
    return ReportMetric(
      value: '${rate.toStringAsFixed(0)} bpm',
      label: rate < 60
          ? 'Below usual resting range'
          : 'Above usual resting range',
      detail: 'Activity, stress, fitness, and medicines can affect heart rate.',
    );
  }

  static ReportMetric _oxygenResult(LiveReading reading, bool pulseUsable) {
    if (!pulseUsable || reading.spo2 == null) {
      return const ReportMetric(
        value: '--',
        label: 'Not available',
        detail: 'Keep your finger still on the sensor.',
      );
    }

    final oxygen = reading.spo2!;
    if (oxygen >= 95) {
      return ReportMetric(
        value: '${oxygen.toStringAsFixed(0)}%',
        label: 'Expected range',
        detail: 'Experimental estimate; sensor accuracy can vary.',
      );
    }
    if (oxygen >= 93) {
      return ReportMetric(
        value: '${oxygen.toStringAsFixed(0)}%',
        label: 'Repeat recommended',
        detail: 'Rest, warm your hand, and check again.',
      );
    }
    return ReportMetric(
      value: '${oxygen.toStringAsFixed(0)}%',
      label: 'Low reading',
      detail: 'Repeat immediately and follow the report guidance.',
    );
  }

  static bool _outsideRestingHeartRate(double? heartRate) {
    return heartRate != null && (heartRate < 60 || heartRate > 100);
  }

  static List<WellnessTip> _tipsFor({
    required ReportLevel level,
    required bool pulseUsable,
    required double? heartRate,
    required double? oxygen,
    required bool skinChanged,
  }) {
    if (!pulseUsable) {
      return const [
        WellnessTip(
          title: 'Warm and relax your hand',
          detail:
              'Cold hands and tense fingers can make pulse and oxygen readings less reliable.',
          iconName: 'hand',
        ),
        WellnessTip(
          title: 'Stay still for a steady number',
          detail:
              'Rest your hand and wait until the measurement stops changing.',
          iconName: 'timer',
        ),
        WellnessTip(
          title: 'Check sensor placement',
          detail:
              'Cover the finger sensor fully and make sure the other sensors have firm contact.',
          iconName: 'sensor',
        ),
      ];
    }

    final tips = <WellnessTip>[];
    if (level == ReportLevel.caution || level == ReportLevel.urgent) {
      tips.add(
        const WellnessTip(
          title: 'Repeat after resting',
          detail:
              'Sit quietly for five minutes, then repeat the check and compare the result.',
          iconName: 'chair',
        ),
      );
    }
    if (oxygen != null && oxygen < 95) {
      tips.add(
        const WellnessTip(
          title: 'Improve oxygen-reading accuracy',
          detail:
              'Use a warm, relaxed hand, remove nail polish, stay still, and wait for one steady number.',
          iconName: 'oxygen',
        ),
      );
    }
    if (heartRate != null && _outsideRestingHeartRate(heartRate)) {
      tips.add(
        const WellnessTip(
          title: 'Consider recent activity',
          detail:
              'Exercise, stress, caffeine, medicines, and illness can change resting heart rate.',
          iconName: 'heart',
        ),
      );
    }
    if (skinChanged) {
      tips.add(
        const WellnessTip(
          title: 'Read skin response as a trend',
          detail:
              'Temperature, movement, contact, and emotion can change it. Compare several calm readings.',
          iconName: 'trend',
        ),
      );
    }
    tips.add(
      const WellnessTip(
        title: 'Build a consistent routine',
        detail:
            'Measure at a similar time and body position so changes are easier to compare.',
        iconName: 'routine',
      ),
    );
    tips.add(
      const WellnessTip(
        title: 'Keep moving regularly',
        detail:
            'Regular physical activity supports heart health, sleep, and overall wellbeing.',
        iconName: 'walk',
      ),
    );
    return tips.take(4).toList(growable: false);
  }

  static (String, String) _skinResult(
    LiveReading reading,
    _SignalState signal,
  ) {
    if (signal == _SignalState.poor) {
      return (
        'Adjust sensor',
        'Skin contact was not clear enough for a reliable comparison.',
      );
    }
    if (signal == _SignalState.unknown) {
      return ('Waiting', 'Keep still while the skin sensor gathers data.');
    }

    final change = reading.gsrChange.abs();
    if (change <= 0.05) {
      return (
        'Steady',
        'Your skin response stayed close to its recent baseline.',
      );
    }
    if (change <= 0.2) {
      return (
        'Small change',
        'A small change from your recent skin-response baseline was detected.',
      );
    }
    return (
      'Change detected',
      'Movement, sensor contact, temperature, and emotion can affect this result.',
    );
  }

  static (String, String) _heartSignalResult(_SignalState signal) {
    return switch (signal) {
      _SignalState.good => (
        'Clear',
        'The heart sensor has a clear signal for monitoring.',
      ),
      _SignalState.fair => (
        'Fair',
        'The signal is usable, but staying still may improve it.',
      ),
      _SignalState.poor => (
        'Adjust sensor',
        'Check sensor placement and remain still, then repeat the reading.',
      ),
      _SignalState.unknown => ('Waiting', 'Waiting for a usable heart signal.'),
    };
  }

  static _SignalState _signalState(String quality) {
    final value = quality.trim().toLowerCase();
    if (value.isEmpty ||
        value == 'unknown' ||
        value.contains('waiting') ||
        value.contains('no signal')) {
      return _SignalState.unknown;
    }
    if (value.contains('poor') ||
        value.contains('bad') ||
        value.contains('invalid') ||
        value.contains('unstable') ||
        value.contains('disconnect') ||
        value.contains('not detected')) {
      return _SignalState.poor;
    }
    if (value.contains('fair') ||
        value.contains('average') ||
        value.contains('moderate')) {
      return _SignalState.fair;
    }
    return _SignalState.good;
  }
}

enum _SignalState { good, fair, poor, unknown }
