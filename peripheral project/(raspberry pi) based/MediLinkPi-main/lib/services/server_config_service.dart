import 'package:shared_preferences/shared_preferences.dart';

import '../core/constants/api_constants.dart';

class ServerConfigService {
  ServerConfigService(this._preferences);

  static const _hostKey = 'server_host';
  static const _portKey = 'server_port';
  final SharedPreferences _preferences;

  String get host =>
      _preferences.getString(_hostKey) ?? ApiConstants.defaultHost;
  int get port => _preferences.getInt(_portKey) ?? ApiConstants.serverPort;
  bool get hasSavedServer => _preferences.containsKey(_hostKey);

  Uri get httpBaseUri => Uri(scheme: 'http', host: host, port: port);
  Uri get webSocketBaseUri => Uri(scheme: 'ws', host: host, port: port);

  Future<void> save({required String host, required int port}) async {
    final normalizedHost = normalizeHost(host);
    await _preferences.setString(_hostKey, normalizedHost);
    await _preferences.setInt(_portKey, port);
  }

  static String normalizeHost(String value) {
    var host = value.trim();
    if (host.contains('://')) {
      host = Uri.tryParse(host)?.host ?? host;
    }
    if (host.contains(':') && !host.contains(']')) {
      host = host.split(':').first;
    }
    return host;
  }
}
