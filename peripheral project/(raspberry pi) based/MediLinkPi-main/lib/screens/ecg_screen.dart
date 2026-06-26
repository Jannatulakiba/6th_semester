import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/dashboard_controller.dart';
import '../controllers/ecg_controller.dart';
import '../core/view_state.dart';
import '../models/wellness_report.dart';
import '../widgets/ecg_chart.dart';

class EcgScreen extends StatelessWidget {
  const EcgScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ecg = context.watch<EcgController>();
    final reading = context.watch<DashboardController>().reading;
    final report = reading == null ? null : WellnessReport.fromReading(reading);
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Text(
            'Heart signal',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF102A43),
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'See whether the heart sensor has clear contact',
            style: TextStyle(color: Color(0xFF627D98)),
          ),
          const SizedBox(height: 22),
          Row(
            children: [
              Expanded(
                child: _Metric(
                  label: 'Heart signal',
                  value: report?.heartSignal ?? 'Waiting',
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _Metric(
                  label: 'Monitoring',
                  value: ecg.isRunning ? 'Live' : 'Paused',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            child: SizedBox(
              height: 330,
              child: Stack(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: EcgChart(points: ecg.points),
                  ),
                  if (ecg.points.isEmpty)
                    const Center(
                      child: Text(
                        'Waiting for heart sensor data…',
                        style: TextStyle(color: Color(0xFF829AB1)),
                      ),
                    ),
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: (ecg.isRunning ? Colors.green : Colors.blueGrey)
                            .withValues(alpha: .1),
                        borderRadius: BorderRadius.circular(99),
                      ),
                      child: Text(
                        ecg.isRunning ? 'LIVE' : 'PAUSED',
                        style: TextStyle(
                          color: ecg.isRunning
                              ? Colors.green.shade700
                              : Colors.blueGrey,
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (ecg.state == ViewState.error) ...[
            const SizedBox(height: 12),
            Text(
              ecg.errorMessage ?? 'Heart sensor connection failed.',
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ],
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: ecg.isRunning ? ecg.stop : ecg.start,
                  icon: Icon(
                    ecg.isRunning
                        ? Icons.pause_rounded
                        : Icons.play_arrow_rounded,
                  ),
                  label: Text(
                    ecg.isRunning ? 'Pause monitoring' : 'Start monitoring',
                  ),
                ),
              ),
              const SizedBox(width: 12),
              OutlinedButton.icon(
                onPressed: ecg.clear,
                icon: const Icon(Icons.delete_sweep_outlined),
                label: const Text('Clear'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(110, 52),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          if (report != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.info_outline_rounded,
                      color: Color(0xFF627D98),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        report.heartSignalDetail,
                        style: const TextStyle(
                          color: Color(0xFF627D98),
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          const Text(
            'This pattern only confirms that the prototype sensor is receiving a signal. It cannot diagnose a heart condition.',
            style: TextStyle(color: Color(0xFF829AB1), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _Metric extends StatelessWidget {
  const _Metric({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(color: Color(0xFF627D98), fontSize: 12),
            ),
            const SizedBox(height: 5),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                color: Color(0xFF102A43),
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
