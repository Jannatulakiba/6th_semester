class ApiConstants {
  ApiConstants._();

  static const int serverPort = 8000;
  static const String defaultHost = 'medilink.local';

  static const String health = '/health';
  static const String live = '/live';
  static const String status = '/status';
  static const String history = '/history';
  static const String liveSocket = '/ws/live';
  static const String ecgSocket = '/ws/ecg';
}
