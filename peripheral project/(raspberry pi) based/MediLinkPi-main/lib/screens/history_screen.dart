import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/history_controller.dart';
import '../core/utils/date_formatter.dart';
import '../core/view_state.dart';
import '../models/live_reading.dart';
import '../models/wellness_report.dart';
import '../widgets/loading_view.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<HistoryController>();
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 12, 12),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'History',
                        style: Theme.of(context).textTheme.headlineSmall
                            ?.copyWith(
                              fontWeight: FontWeight.w900,
                              color: const Color(0xFF102A43),
                            ),
                      ),
                      const Text(
                        'Review your previous wellness reports',
                        style: TextStyle(color: Color(0xFF627D98)),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: controller.load,
                  tooltip: 'Refresh',
                  icon: const Icon(Icons.refresh_rounded),
                ),
              ],
            ),
          ),
          Expanded(child: _body(controller)),
        ],
      ),
    );
  }

  Widget _body(HistoryController controller) {
    if (controller.state == ViewState.initial) {
      return Center(
        child: FilledButton.icon(
          onPressed: controller.load,
          icon: const Icon(Icons.history_rounded),
          label: const Text('Load history'),
        ),
      );
    }
    if (controller.state == ViewState.loading) {
      return const LoadingView(message: 'Loading saved readings…');
    }
    if (controller.state == ViewState.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                size: 40,
                color: Color(0xFFD64550),
              ),
              const SizedBox(height: 12),
              Text(
                controller.errorMessage ?? 'Could not load history.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: controller.load,
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }
    if (controller.readings.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.inventory_2_outlined,
              size: 42,
              color: Color(0xFF829AB1),
            ),
            SizedBox(height: 12),
            Text('No saved readings yet.'),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: controller.load,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
        itemCount: controller.readings.length,
        separatorBuilder: (_, index) => const SizedBox(height: 10),
        itemBuilder: (_, index) =>
            _HistoryCard(reading: controller.readings[index]),
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  const _HistoryCard({required this.reading});

  final LiveReading reading;

  @override
  Widget build(BuildContext context) {
    final report = WellnessReport.fromReading(reading);
    return Card(
      child: ExpansionTile(
        shape: const Border(),
        collapsedShape: const Border(),
        tilePadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 5),
        childrenPadding: const EdgeInsets.fromLTRB(18, 0, 18, 16),
        leading: CircleAvatar(
          backgroundColor: _reportColor(report.level).withValues(alpha: .1),
          child: Icon(
            _reportIcon(report.level),
            color: _reportColor(report.level),
          ),
        ),
        title: Text(
          report.title,
          style: const TextStyle(fontWeight: FontWeight.w800),
        ),
        subtitle: Text(DateFormatter.dateTime(reading.timestamp)),
        children: [
          _row(
            'Heart rate',
            '${report.heartRate.value} · ${report.heartRate.label}',
          ),
          _row(
            'Blood oxygen',
            '${report.oxygen.value} · ${report.oxygen.label}',
          ),
          _row('Skin response', report.skinResponse),
          _row('Heart signal', report.heartSignal),
          _row('Sensor checks', report.sensorChecks.value),
        ],
      ),
    );
  }

  Color _reportColor(ReportLevel level) {
    return switch (level) {
      ReportLevel.reassuring => const Color(0xFF18856F),
      ReportLevel.caution => const Color(0xFFE18A17),
      ReportLevel.urgent => const Color(0xFFD64550),
      ReportLevel.incomplete => const Color(0xFF627D98),
    };
  }

  IconData _reportIcon(ReportLevel level) {
    return switch (level) {
      ReportLevel.reassuring => Icons.check_circle_rounded,
      ReportLevel.caution => Icons.info_rounded,
      ReportLevel.urgent => Icons.warning_rounded,
      ReportLevel.incomplete => Icons.sensors_off_rounded,
    };
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: Color(0xFF627D98)),
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}
