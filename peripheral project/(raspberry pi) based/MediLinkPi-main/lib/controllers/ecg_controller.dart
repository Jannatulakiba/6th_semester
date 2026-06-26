import 'dart:async';

import 'package:flutter/foundation.dart';

import '../core/view_state.dart';
import '../repositories/medilink_repository.dart';

class EcgController extends ChangeNotifier {
  EcgController(this._repository);

  final MediLinkRepository _repository;
  final List<double> _points = [];
  StreamSubscription<double>? _subscription;
  Timer? _reconnectTimer;
  bool _disposed = false;

  ViewState state = ViewState.initial;
  String? errorMessage;
  bool isRunning = false;
  List<double> get points => List.unmodifiable(_points);
  double? get currentVoltage => _points.isEmpty ? null : _points.last;

  void start() {
    _subscription?.cancel();
    _reconnectTimer?.cancel();
    isRunning = true;
    state = ViewState.loading;
    errorMessage = null;
    notifyListeners();
    _subscription = _repository.watchEcgVoltage().listen(
      (value) {
        _points.add(value);
        if (_points.length > 400) {
          _points.removeRange(0, _points.length - 400);
        }
        state = ViewState.success;
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
    if (!isRunning || _disposed) return;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 3), start);
  }

  void stop() {
    isRunning = false;
    _reconnectTimer?.cancel();
    _subscription?.cancel();
    _subscription = null;
    notifyListeners();
  }

  void clear() {
    _points.clear();
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    stop();
    super.dispose();
  }
}
