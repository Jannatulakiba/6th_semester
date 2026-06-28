class HealthResponse {
  const HealthResponse({required this.healthy, required this.message});

  final bool healthy;
  final String message;

  factory HealthResponse.fromJson(Map<String, dynamic> json) {
    final status = json['status']?.toString().trim().toLowerCase();
    final healthyValue = json['healthy'];
    final explicitlyUnhealthy =
        healthyValue == false ||
        status == 'error' ||
        status == 'unhealthy' ||
        status == 'offline' ||
        status == 'failed' ||
        status == 'down';

    return HealthResponse(
      // ApiService already guarantees a successful 2xx response. Treat that
      // as healthy unless the server explicitly reports a failure state.
      healthy: !explicitlyUnhealthy,
      message:
          json['message']?.toString() ??
          json['status']?.toString() ??
          'Server responded',
    );
  }
}
