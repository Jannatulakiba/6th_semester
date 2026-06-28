import 'package:flutter/foundation.dart';

import '../core/view_state.dart';
import '../models/live_reading.dart';
import '../repositories/medilink_repository.dart';

class HistoryController extends ChangeNotifier {
  HistoryController(this._repository);

  final MediLinkRepository _repository;

  ViewState state = ViewState.initial;
  List<LiveReading> readings = const [];
  String? errorMessage;

  Future<void> load() async {
    state = ViewState.loading;
    errorMessage = null;
    notifyListeners();
    try {
      readings = await _repository.getHistory();
      state = ViewState.success;
    } catch (error) {
      state = ViewState.error;
      errorMessage = error.toString();
    }
    notifyListeners();
  }

  Future<bool> clear() async {
    try {
      await _repository.deleteHistory();
      readings = const [];
      state = ViewState.success;
      notifyListeners();
      return true;
    } catch (error) {
      state = ViewState.error;
      errorMessage = error.toString();
      notifyListeners();
      return false;
    }
  }
}
