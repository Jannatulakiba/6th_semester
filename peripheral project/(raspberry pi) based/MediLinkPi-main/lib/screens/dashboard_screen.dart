import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/connection_controller.dart';
import '../controllers/dashboard_controller.dart';
import '../core/utils/date_formatter.dart';
import '../core/view_state.dart';
import '../models/live_reading.dart';
import '../models/wellness_report.dart';
import '../widgets/connection_badge.dart';
import '../widgets/loading_view.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dashboard = context.watch<DashboardController>();
    final connection = context.watch<ConnectionController>();
    final reading = dashboard.reading;

    if (dashboard.state == ViewState.loading && reading == null) {
      return const SafeArea(child: LoadingView());
    }

    return SafeArea(
      child: RefreshIndicator(
        onRefresh: dashboard.start,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
              sliver: SliverList.list(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Health report',
                              style: Theme.of(context).textTheme.headlineSmall
                                  ?.copyWith(
                                    fontWeight: FontWeight.w900,
                                    color: const Color(0xFF102A43),
                                  ),
                            ),
                            Text(
                              reading == null
                                  ? 'Waiting for your latest check'
                                  : 'Updated ${DateFormatter.time(reading.timestamp)}',
                              style: const TextStyle(color: Color(0xFF627D98)),
                            ),
                          ],
                        ),
                      ),
                      ConnectionBadge(state: connection.state),
                    ],
                  ),
                  const SizedBox(height: 22),
                  if (dashboard.errorMessage != null) ...[
                    _ErrorCard(
                      message: dashboard.errorMessage!,
                      onRetry: dashboard.start,
                    ),
                    const SizedBox(height: 14),
                  ],
                  if (reading != null) ...[
                    _WellnessReportCard(reading: reading),
                    const SizedBox(height: 24),
                    const _SectionTitle(
                      title: 'Your measurements',
                      subtitle: 'Based on the latest usable sensor reading',
                    ),
                    const SizedBox(height: 12),
                    _VitalGrid(reading: reading),
                    const SizedBox(height: 24),
                    const _SectionTitle(
                      title: 'Sensor insights',
                      subtitle: 'Plain-language observations, not diagnoses',
                    ),
                    const SizedBox(height: 12),
                    _SignalDetails(reading: reading),
                    const SizedBox(height: 24),
                    const _SectionTitle(
                      title: 'What your numbers mean',
                      subtitle:
                          'Simple reference information for adults at rest',
                    ),
                    const SizedBox(height: 12),
                    const _ReferenceCard(),
                    const SizedBox(height: 24),
                    const _SectionTitle(
                      title: 'Health tips for you',
                      subtitle: 'Suggestions based on this reading',
                    ),
                    const SizedBox(height: 12),
                    _HealthTips(report: WellnessReport.fromReading(reading)),
                  ] else
                    const _EmptyDashboard(),
                  const SizedBox(height: 14),
                  Text(
                    'MediLink is an experimental wellness monitor, not a certified medical device. Always consider how you feel.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF829AB1),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _WellnessReportCard extends StatelessWidget {
  const _WellnessReportCard({required this.reading});

  final LiveReading reading;

  @override
  Widget build(BuildContext context) {
    final report = WellnessReport.fromReading(reading);
    final (color, icon) = switch (report.level) {
      ReportLevel.reassuring => (
        const Color(0xFF18856F),
        Icons.check_circle_rounded,
      ),
      ReportLevel.caution => (const Color(0xFFE18A17), Icons.info_rounded),
      ReportLevel.urgent => (const Color(0xFFD64550), Icons.warning_rounded),
      ReportLevel.incomplete => (
        const Color(0xFF627D98),
        Icons.sensors_off_rounded,
      ),
    };

    return Container(
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: .2),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: .16),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: Colors.white, size: 27),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Latest wellness check',
                    style: TextStyle(
                      color: Colors.white70,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              report.title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              report.summary,
              style: const TextStyle(color: Colors.white, height: 1.4),
            ),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: .14),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'WHAT TO DO NEXT',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: .7,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    report.nextStep,
                    style: const TextStyle(
                      color: Colors.white,
                      height: 1.35,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VitalGrid extends StatelessWidget {
  const _VitalGrid({required this.reading});

  final LiveReading reading;

  @override
  Widget build(BuildContext context) {
    final report = WellnessReport.fromReading(reading);
    final wide = MediaQuery.sizeOf(context).width > 700;
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: wide ? 1.8 : .8,
      children: [
        _VitalCard(
          label: 'Resting heart rate',
          metric: report.heartRate,
          icon: Icons.favorite_rounded,
          color: const Color(0xFFE25563),
        ),
        _VitalCard(
          label: 'Blood oxygen estimate',
          metric: report.oxygen,
          icon: Icons.water_drop_rounded,
          color: const Color(0xFF2E86AB),
        ),
        _VitalCard(
          label: 'Skin response change',
          metric: report.skinChange,
          icon: Icons.trending_up_rounded,
          color: const Color(0xFFF29F3D),
        ),
        _VitalCard(
          label: 'Sensor checks',
          metric: report.sensorChecks,
          icon: Icons.sensors_rounded,
          color: const Color(0xFF7C5CFC),
        ),
      ],
    );
  }
}

class _VitalCard extends StatelessWidget {
  const _VitalCard({
    required this.label,
    required this.metric,
    required this.icon,
    required this.color,
  });

  final String label;
  final ReportMetric metric;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(
                color: color.withValues(alpha: .1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 21),
            ),
            const Spacer(),
            Text(
              label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Color(0xFF627D98), fontSize: 11),
            ),
            const SizedBox(height: 3),
            Text(
              metric.value,
              maxLines: 1,
              style: const TextStyle(
                color: Color(0xFF102A43),
                fontSize: 23,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              metric.label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 3),
            Expanded(
              child: Text(
                metric.detail,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF829AB1),
                  fontSize: 10,
                  height: 1.25,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReferenceCard extends StatelessWidget {
  const _ReferenceCard();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(18),
        child: Column(
          children: [
            _ReferenceRow(
              icon: Icons.favorite_rounded,
              color: Color(0xFFE25563),
              title: 'Resting heart rate',
              range: '60–100 bpm',
              detail:
                  'A common range for most adults who are calm and resting. Fitness, stress, medicines, and illness can affect it.',
            ),
            Divider(height: 25, color: Color(0xFFEDF2F7)),
            _ReferenceRow(
              icon: Icons.water_drop_rounded,
              color: Color(0xFF2E86AB),
              title: 'Blood oxygen estimate',
              range: '95–100%',
              detail:
                  'A typical range for many healthy adults. This prototype estimate can be affected by movement, cold hands, and placement.',
            ),
            Divider(height: 25, color: Color(0xFFEDF2F7)),
            _ReferenceRow(
              icon: Icons.spa_rounded,
              color: Color(0xFFF29F3D),
              title: 'Skin response',
              range: 'Personal trend',
              detail:
                  'There is no universal normal number. Compare calm readings with your own recent baseline.',
            ),
          ],
        ),
      ),
    );
  }
}

class _ReferenceRow extends StatelessWidget {
  const _ReferenceRow({
    required this.icon,
    required this.color,
    required this.title,
    required this.range,
    required this.detail,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String range;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: color.withValues(alpha: .1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 21),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      title,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                  Text(
                    range,
                    style: TextStyle(color: color, fontWeight: FontWeight.w900),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                detail,
                style: const TextStyle(
                  color: Color(0xFF627D98),
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HealthTips extends StatelessWidget {
  const _HealthTips({required this.report});

  final WellnessReport report;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            for (var index = 0; index < report.tips.length; index++) ...[
              _TipRow(tip: report.tips[index]),
              if (index < report.tips.length - 1)
                const Divider(height: 25, color: Color(0xFFEDF2F7)),
            ],
          ],
        ),
      ),
    );
  }
}

class _TipRow extends StatelessWidget {
  const _TipRow({required this.tip});

  final WellnessTip tip;

  @override
  Widget build(BuildContext context) {
    final icon = switch (tip.iconName) {
      'hand' => Icons.back_hand_outlined,
      'timer' => Icons.timer_outlined,
      'sensor' => Icons.sensors_outlined,
      'chair' => Icons.chair_outlined,
      'oxygen' => Icons.air_rounded,
      'heart' => Icons.favorite_outline_rounded,
      'trend' => Icons.show_chart_rounded,
      'walk' => Icons.directions_walk_rounded,
      _ => Icons.event_repeat_rounded,
    };
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(9),
          decoration: BoxDecoration(
            color: const Color(0xFF00897B).withValues(alpha: .1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: const Color(0xFF00897B), size: 21),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                tip.title,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 3),
              Text(
                tip.detail,
                style: const TextStyle(
                  color: Color(0xFF627D98),
                  fontSize: 12,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SignalDetails extends StatelessWidget {
  const _SignalDetails({required this.reading});

  final LiveReading reading;

  @override
  Widget build(BuildContext context) {
    final report = WellnessReport.fromReading(reading);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            _ReportRow(
              icon: Icons.spa_rounded,
              label: 'Skin response',
              value: report.skinResponse,
              detail: report.skinResponseDetail,
            ),
            _ReportRow(
              icon: Icons.monitor_heart_rounded,
              label: 'Heart sensor',
              value: report.heartSignal,
              detail: report.heartSignalDetail,
              last: true,
            ),
          ],
        ),
      ),
    );
  }
}

class _ReportRow extends StatelessWidget {
  const _ReportRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.detail,
    this.last = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final String detail;
  final bool last;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: Color(0xFFEDF2F7))),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: Icon(icon, size: 20, color: const Color(0xFF627D98)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        label,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                    Text(
                      value,
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  detail,
                  style: const TextStyle(
                    color: Color(0xFF627D98),
                    fontSize: 12,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          style: const TextStyle(color: Color(0xFF829AB1), fontSize: 12),
        ),
      ],
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          children: [
            Icon(
              Icons.cloud_off_rounded,
              color: Theme.of(context).colorScheme.error,
              size: 34,
            ),
            const SizedBox(height: 10),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 10),
            TextButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Reconnect'),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyDashboard extends StatelessWidget {
  const _EmptyDashboard();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(28),
        child: Column(
          children: [
            Icon(Icons.sensors_off_rounded, size: 42, color: Color(0xFF829AB1)),
            SizedBox(height: 12),
            Text('No wellness report is available yet.'),
            SizedBox(height: 5),
            Text(
              'Check the sensor connection and keep your finger in place.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF829AB1)),
            ),
          ],
        ),
      ),
    );
  }
}
