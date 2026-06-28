import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

import '../core/errors/app_exception.dart';
import 'server_config_service.dart';

class WebSocketService {
  WebSocketService(this._config);

  final ServerConfigService _config;

  Stream<dynamic> connect(String path) async* {
    WebSocketChannel? channel;
    try {
      final uri = _config.webSocketBaseUri.replace(path: path);
      channel = WebSocketChannel.connect(uri);
      await channel.ready.timeout(const Duration(seconds: 8));
      await for (final event in channel.stream) {
        if (event is String) {
          yield jsonDecode(event);
        } else {
          yield event;
        }
      }
    } catch (error) {
      throw AppException('Live connection was interrupted.', cause: error);
    } finally {
      await channel?.sink.close();
    }
  }
}
