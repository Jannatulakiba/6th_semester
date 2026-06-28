import 'package:flutter/material.dart';

class EcgChart extends StatelessWidget {
  const EcgChart({super.key, required this.points});

  final List<double> points;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _EcgPainter(
        points: points,
        lineColor: Theme.of(context).colorScheme.primary,
      ),
      child: const SizedBox.expand(),
    );
  }
}

class _EcgPainter extends CustomPainter {
  const _EcgPainter({required this.points, required this.lineColor});

  final List<double> points;
  final Color lineColor;

  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = const Color(0xFFE6EEF4)
      ..strokeWidth = 1;
    for (double x = 0; x <= size.width; x += 24) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y <= size.height; y += 24) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
    if (points.length < 2) return;

    var minValue = points.first;
    var maxValue = points.first;
    for (final point in points) {
      if (point < minValue) minValue = point;
      if (point > maxValue) maxValue = point;
    }
    final range = (maxValue - minValue).abs() < .001
        ? 1.0
        : maxValue - minValue;
    final path = Path();
    for (var index = 0; index < points.length; index++) {
      final x = index / (points.length - 1) * size.width;
      final normalized = (points[index] - minValue) / range;
      final y =
          size.height - (normalized * size.height * .75 + size.height * .125);
      if (index == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    canvas.drawPath(
      path,
      Paint()
        ..color = lineColor
        ..strokeWidth = 2.2
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round,
    );
  }

  @override
  bool shouldRepaint(covariant _EcgPainter oldDelegate) =>
      oldDelegate.points != points || oldDelegate.lineColor != lineColor;
}
