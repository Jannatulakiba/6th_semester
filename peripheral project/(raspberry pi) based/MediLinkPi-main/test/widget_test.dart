import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:medipi/app.dart';
import 'package:medipi/models/health_response.dart';
import 'package:medipi/models/live_reading.dart';
import 'package:medipi/models/wellness_report.dart';
import 'package:medipi/services/server_config_service.dart';
import 'package:medipi/services/websocket_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('shows server setup when no address has been saved', (
    tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final preferences = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      MediLinkApp(config: ServerConfigService(preferences)),
    );
    await tester.pump(const Duration(milliseconds: 800));
    await tester.pumpAndSettle();

    expect(find.text('Connect to your Pi'), findsOneWidget);
    expect(find.text('Test, save & connect'), findsOneWidget);
  });

  testWidgets('successful health response opens the home screen', (
    tester,
  ) async {
    final client = MockClient((request) async {
      if (request.url.path == '/health') {
        return http.Response(jsonEncode({'message': 'Server responded'}), 200);
      }
      if (request.url.path == '/live') {
        return http.Response(
          jsonEncode({
            'timestamp': '2026-06-15T10:43:41.507',
            'status': 'Normal',
          }),
          200,
        );
      }
      return http.Response('{}', 404);
    });

    SharedPreferences.setMockInitialValues({});
    final preferences = await SharedPreferences.getInstance();
    final config = ServerConfigService(preferences);
    await tester.pumpWidget(
      MediLinkApp(
        config: config,
        httpClient: client,
        webSocketService: _SilentWebSocketService(config),
      ),
    );
    await tester.pump(const Duration(milliseconds: 800));
    await tester.pumpAndSettle();

    final fields = find.byType(TextField);
    await tester.enterText(fields.at(0), '192.168.1.199');
    await tester.enterText(fields.at(1), '8000');
    await tester.tap(find.text('Test, save & connect'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.text('Report'), findsOneWidget);
    expect(find.text('Heart'), findsOneWidget);
    expect(find.text('History'), findsOneWidget);
    expect(find.text('Settings'), findsOneWidget);
  });

  test('health response defaults to healthy after a successful HTTP call', () {
    final response = HealthResponse.fromJson({'message': 'Server responded'});

    expect(response.healthy, isTrue);
    expect(response.message, 'Server responded');
  });

  test('health response honors an explicit unhealthy result', () {
    expect(HealthResponse.fromJson({'healthy': false}).healthy, isFalse);
    expect(HealthResponse.fromJson({'status': 'offline'}).healthy, isFalse);
  });

  test('LiveReading preserves missing optional sensor values', () {
    final reading = LiveReading.fromJson({
      'timestamp': '2026-06-15T10:43:41.507',
      'heart_rate': null,
      'spo2': null,
      'finger_detected': false,
      'gsr_voltage': '3.7264',
      'ecg_voltage': 0.7885,
      'status': 'Normal',
    });

    expect(reading.heartRate, isNull);
    expect(reading.spo2, isNull);
    expect(reading.gsrVoltage, 3.7264);
    expect(reading.ecgVoltage, 0.7885);
    expect(reading.status, 'Normal');
  });

  test('wellness report translates sensor data into user language', () {
    final reading = LiveReading.fromJson({
      'timestamp': '2026-06-15T10:43:41.507',
      'gsr_change': 0.03,
      'gsr_baseline': 3.0,
      'gsr_quality': 'Good',
      'ecg_quality': 'Good',
      'finger_detected': true,
      'max30102_quality': 'Good',
      'heart_rate': 72,
      'spo2': 98,
      'status': 'Normal',
    });

    final report = WellnessReport.fromReading(reading);

    expect(report.title, 'Readings look steady');
    expect(report.heartRate.label, 'Usual resting range');
    expect(report.oxygen.label, 'Expected range');
    expect(report.skinChange.value, '+1.0%');
    expect(report.sensorChecks.value, '3/3');
    expect(report.skinResponse, 'Steady');
    expect(report.heartSignal, 'Clear');
    expect(report.tips, isNotEmpty);
  });

  test('wellness report asks for sensor adjustment on poor signals', () {
    final reading = LiveReading.fromJson({
      'gsr_change': 0.4,
      'gsr_quality': 'Poor contact',
      'ecg_quality': 'Unstable',
      'max30102_quality': 'Poor contact',
      'status': 'Normal',
    });

    final report = WellnessReport.fromReading(reading);

    expect(report.title, 'Reading incomplete');
    expect(report.skinResponse, 'Adjust sensor');
    expect(report.heartSignal, 'Adjust sensor');
  });

  test(
    'wellness report describes a skin response change without diagnosis',
    () {
      final reading = LiveReading.fromJson({
        'gsr_change': -0.35,
        'gsr_quality': 'Good',
        'ecg_quality': 'Fair',
        'finger_detected': true,
        'max30102_quality': 'Good',
        'heart_rate': 75,
        'spo2': 97,
        'status': 'Normal',
      });

      final report = WellnessReport.fromReading(reading);

      expect(report.skinResponse, 'Change detected');
      expect(report.skinResponseDetail, contains('Movement'));
      expect(report.heartSignal, 'Fair');
    },
  );

  test('wellness report does not interpret vitals without good contact', () {
    final reading = LiveReading.fromJson({
      'finger_detected': false,
      'max30102_quality': 'Poor',
      'heart_rate': 150,
      'spo2': 80,
      'gsr_quality': 'Good',
      'ecg_quality': 'Good',
      'status': 'Normal',
    });

    final report = WellnessReport.fromReading(reading);

    expect(report.level, ReportLevel.incomplete);
    expect(report.heartRate.value, '--');
    expect(report.oxygen.value, '--');
  });

  test('wellness report recommends repeating borderline oxygen result', () {
    final reading = LiveReading.fromJson({
      'finger_detected': true,
      'max30102_quality': 'Good',
      'heart_rate': 72,
      'spo2': 94,
      'gsr_quality': 'Good',
      'ecg_quality': 'Good',
      'status': 'Normal',
    });

    final report = WellnessReport.fromReading(reading);

    expect(report.level, ReportLevel.caution);
    expect(report.oxygen.label, 'Repeat recommended');
  });

  test('wellness report gives urgent guidance for persistent low oxygen', () {
    final reading = LiveReading.fromJson({
      'finger_detected': true,
      'max30102_quality': 'Good',
      'heart_rate': 72,
      'spo2': 92,
      'gsr_quality': 'Good',
      'ecg_quality': 'Good',
      'status': 'Normal',
    });

    final report = WellnessReport.fromReading(reading);

    expect(report.level, ReportLevel.urgent);
    expect(report.title, 'Low oxygen reading');
    expect(report.nextStep, contains('urgent medical help'));
  });
}

class _SilentWebSocketService extends WebSocketService {
  _SilentWebSocketService(super.config);

  @override
  Stream<dynamic> connect(String path) => StreamController<dynamic>().stream;
}
