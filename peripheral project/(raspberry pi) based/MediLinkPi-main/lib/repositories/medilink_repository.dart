import '../core/constants/api_constants.dart';
import '../core/errors/app_exception.dart';
import '../models/health_response.dart';
import '../models/live_reading.dart';
import '../services/api_service.dart';
import '../services/websocket_service.dart';

class MediLinkRepository {
  MediLinkRepository(this._api, this._socket);

  final ApiService _api;
  final WebSocketService _socket;

  Future<HealthResponse> getHealth() async {
    final data = await _api.get(ApiConstants.health);
    if (data is! Map) {
      return const HealthResponse(healthy: true, message: 'Server responded');
    }
    return HealthResponse.fromJson(Map<String, dynamic>.from(data));
  }

  Future<LiveReading> getLiveReading() async {
    final data = await _api.get(ApiConstants.live);
    return _readingFrom(data);
  }

  Future<List<LiveReading>> getHistory({int limit = 100}) async {
    final data = await _api.get(ApiConstants.history, query: {'limit': limit});
    final items = data is List
        ? data
        : data is Map
        ? (data['readings'] ?? data['history'] ?? data['items'])
        : null;
    if (items is! List) return const [];
    return items
        .whereType<Map>()
        .map((item) => LiveReading.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<void> deleteHistory() => _api.delete(ApiConstants.history);

  Stream<LiveReading> watchLiveReadings() {
    return _socket.connect(ApiConstants.liveSocket).map(_readingFrom);
  }

  Stream<double> watchEcgVoltage() {
    return _socket.connect(ApiConstants.ecgSocket).map((data) {
      dynamic value = data;
      if (data is Map) {
        value =
            data['ecg_voltage'] ??
            data['voltage'] ??
            data['value'] ??
            data['ecg'];
      }
      if (value is num) return value.toDouble();
      final parsed = double.tryParse(value?.toString() ?? '');
      if (parsed == null) {
        throw const AppException('Invalid ECG sample received.');
      }
      return parsed;
    });
  }

  LiveReading _readingFrom(dynamic data) {
    if (data is Map && data['reading'] is Map) {
      data = data['reading'];
    }
    if (data is! Map) {
      throw const AppException('Invalid sensor reading received.');
    }
    return LiveReading.fromJson(Map<String, dynamic>.from(data));
  }
}
