import 'package:flutter/foundation.dart';

import '../core/view_state.dart';
import '../repositories/medilink_repository.dart';
import '../services/server_config_service.dart';

class ConnectionController extends ChangeNotifier {
  ConnectionController(this._config, this._repository);

  final ServerConfigService _config;
  final MediLinkRepository _repository;

  ServerConnectionState state = ServerConnectionState.disconnected;
  String? errorMessage;

  String get host => _config.host;
  int get port => _config.port;
  bool get hasSavedServer => _config.hasSavedServer;
  bool get isConnected => state == ServerConnectionState.connected;
  String get address => '${_config.host}:${_config.port}';

  Future<bool> testConnection({String? host, int? port}) async {
    state = ServerConnectionState.connecting;
    errorMessage = null;
    notifyListeners();
    try {
      if (host != null && port != null) {
        await _config.save(host: host, port: port);
      }
      final health = await _repository.getHealth();
      if (!health.healthy) {
        throw Exception(health.message);
      }
      state = ServerConnectionState.connected;
      notifyListeners();
      return true;
    } catch (error) {
      state = ServerConnectionState.error;
      errorMessage = error.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  Future<bool> saveAndConnect(String host, int port) {
    return testConnection(host: host, port: port);
  }
}
