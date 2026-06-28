import 'dart:async';

import 'package:flutter/foundation.dart';

import '../core/view_state.dart';
import '../models/live_reading.dart';
import '../repositories/medilink_repository.dart';

class DashboardController extends ChangeNotifier {
  DashboardController(this._repository);

  final MediLinkRepository _repository;
  StreamSubscription<LiveReading>? _subscription;
  Timer? _reconnectTimer;

  ViewState state = ViewState.initial;
  LiveReading? reading;
  String? errorMessage;
  bool _disposed = false;

  Future<void> start() async {
    await stop();
    state = ViewState.loading;
    errorMessage = null;
    notifyListeners();

    try {
      reading = await _repository.getLiveReading();
      state = ViewState.success;
      notifyListeners();
    } catch (error) {
      state = ViewState.error;
      errorMessage = error.toString();
      notifyListeners();
    }

    _subscription = _repository.watchLiveReadings().listen(
      (value) {
        reading = value;
        state = ViewState.success;
        errorMessage = null;
        notifyListeners();
      },
      onError: (Object error) {
        state = ViewState.error;
        errorMessage = error.toString();
        notifyListeners();
        _scheduleReconnect();
      },
      onDone: _scheduleReconnect,
    );
  }

  void _scheduleReconnect() {
    if (_disposed) return;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 3), start);
  }

  Future<void> stop() async {
    _reconnectTimer?.cancel();
    await _subscription?.cancel();
    _subscription = null;
  }

  @override
  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _subscription?.cancel();
    super.dispose();
  }
}
