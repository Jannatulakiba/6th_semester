class LiveReading {
  const LiveReading({
    required this.timestamp,
    required this.heartRate,
    required this.spo2,
    required this.fingerDetected,
    required this.redValue,
    required this.irValue,
    required this.max30102Quality,
    required this.max30102Message,
    required this.gsrRaw,
    required this.gsrVoltage,
    required this.gsrBaseline,
    required this.gsrChange,
    required this.gsrQuality,
    required this.ecgRaw,
    required this.ecgVoltage,
    required this.ecgAverage,
    required this.ecgRange,
    required this.ecgQuality,
    required this.status,
  });

  final DateTime timestamp;
  final double? heartRate;
  final double? spo2;
  final bool fingerDetected;
  final int redValue;
  final int irValue;
  final String max30102Quality;
  final String max30102Message;
  final int gsrRaw;
  final double gsrVoltage;
  final double gsrBaseline;
  final double gsrChange;
  final String gsrQuality;
  final int ecgRaw;
  final double ecgVoltage;
  final double ecgAverage;
  final double ecgRange;
  final String ecgQuality;
  final String status;

  factory LiveReading.fromJson(Map<String, dynamic> json) {
    return LiveReading(
      timestamp:
          DateTime.tryParse(json['timestamp']?.toString() ?? '') ??
          DateTime.now(),
      heartRate: _toNullableDouble(json['heart_rate']),
      spo2: _toNullableDouble(json['spo2']),
      fingerDetected: json['finger_detected'] == true,
      redValue: _toInt(json['red_value']),
      irValue: _toInt(json['ir_value']),
      max30102Quality: json['max30102_quality']?.toString() ?? 'Unknown',
      max30102Message: json['max30102_message']?.toString() ?? '',
      gsrRaw: _toInt(json['gsr_raw']),
      gsrVoltage: _toDouble(json['gsr_voltage']),
      gsrBaseline: _toDouble(json['gsr_baseline']),
      gsrChange: _toDouble(json['gsr_change']),
      gsrQuality: json['gsr_quality']?.toString() ?? 'Unknown',
      ecgRaw: _toInt(json['ecg_raw']),
      ecgVoltage: _toDouble(json['ecg_voltage']),
      ecgAverage: _toDouble(json['ecg_average']),
      ecgRange: _toDouble(json['ecg_range']),
      ecgQuality: json['ecg_quality']?.toString() ?? 'Unknown',
      status: json['status']?.toString() ?? 'Unknown',
    );
  }

  static double _toDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }

  static double? _toNullableDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  static int _toInt(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? 0;
  }
}
