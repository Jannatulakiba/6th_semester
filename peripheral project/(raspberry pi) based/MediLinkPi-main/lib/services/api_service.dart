import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../core/errors/app_exception.dart';
import 'server_config_service.dart';

class ApiService {
  ApiService(this._config, {http.Client? client})
    : _client = client ?? http.Client();

  final ServerConfigService _config;
  final http.Client _client;
  static const _timeout = Duration(seconds: 8);

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) {
    return _request('GET', path, query: query);
  }

  Future<dynamic> post(String path) => _request('POST', path);
  Future<dynamic> delete(String path) => _request('DELETE', path);

  Future<dynamic> _request(
    String method,
    String path, {
    Map<String, dynamic>? query,
  }) async {
    final uri = _config.httpBaseUri.replace(
      path: path,
      queryParameters: query?.map(
        (key, value) => MapEntry(key, value.toString()),
      ),
    );

    try {
      final response = switch (method) {
        'POST' => await _client.post(uri).timeout(_timeout),
        'DELETE' => await _client.delete(uri).timeout(_timeout),
        _ => await _client.get(uri).timeout(_timeout),
      };

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw AppException(
          'Server returned ${response.statusCode}: ${_message(response.body)}',
        );
      }
      if (response.body.trim().isEmpty) return <String, dynamic>{};
      return jsonDecode(response.body);
    } on AppException {
      rethrow;
    } on SocketException catch (error) {
      throw AppException('Could not reach the MediLink server.', cause: error);
    } on FormatException catch (error) {
      throw AppException('The server returned invalid data.', cause: error);
    } catch (error) {
      throw AppException('Network request failed.', cause: error);
    }
  }

  String _message(String body) {
    try {
      final json = jsonDecode(body);
      if (json is Map) {
        return json['detail']?.toString() ??
            json['message']?.toString() ??
            body;
      }
    } catch (_) {}
    return body.isEmpty ? 'No response body' : body;
  }

  void dispose() => _client.close();
}
