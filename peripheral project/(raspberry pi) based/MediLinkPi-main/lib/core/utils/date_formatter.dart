import 'package:intl/intl.dart';

class DateFormatter {
  DateFormatter._();

  static final DateFormat _dateTime = DateFormat('MMM d, yyyy • h:mm:ss a');
  static final DateFormat _time = DateFormat('h:mm:ss a');

  static String dateTime(DateTime value) => _dateTime.format(value.toLocal());
  static String time(DateTime value) => _time.format(value.toLocal());
}
