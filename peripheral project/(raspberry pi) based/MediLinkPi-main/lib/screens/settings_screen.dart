import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/connection_controller.dart';
import '../controllers/dashboard_controller.dart';
import '../controllers/ecg_controller.dart';
import '../controllers/history_controller.dart';
import '../widgets/connection_badge.dart';
import 'server_setup_screen.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final connection = context.watch<ConnectionController>();
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
        children: [
          Text(
            'Settings',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w900,
              color: const Color(0xFF102A43),
            ),
          ),
          const SizedBox(height: 22),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'Sensor device connection',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      ConnectionBadge(state: connection.state),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'http://${connection.address}',
                    style: const TextStyle(
                      color: Color(0xFF627D98),
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _editServer(context),
                          icon: const Icon(Icons.edit_outlined),
                          label: const Text('Edit'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: () => _reconnect(context),
                          icon: const Icon(Icons.sync_rounded),
                          label: const Text('Reconnect'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          _SettingsTile(
            icon: Icons.delete_outline_rounded,
            title: 'Clear saved history',
            subtitle: 'Delete all saved wellness reports',
            destructive: true,
            onTap: () => _clearHistory(context),
          ),
          const SizedBox(height: 10),
          const _SettingsTile(
            icon: Icons.info_outline_rounded,
            title: 'About MediLink',
            subtitle: 'A simple view of your connected wellness sensors',
          ),
          const SizedBox(height: 10),
          const Card(
            child: Padding(
              padding: EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.health_and_safety_outlined,
                        color: Color(0xFFF29F3D),
                      ),
                      SizedBox(width: 10),
                      Text(
                        'Medical disclaimer',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 10),
                  Text(
                    'This prototype is not a medical device. Its heart, oxygen, and skin-response measurements are experimental and must not be used for diagnosis or treatment. Seek professional help when symptoms concern you.',
                    style: TextStyle(color: Color(0xFF627D98), height: 1.45),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _editServer(BuildContext context) async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(
        builder: (_) => const ServerSetupScreen(returnToSettings: true),
      ),
    );
    if (changed == true && context.mounted) await _restartStreams(context);
  }

  Future<void> _reconnect(BuildContext context) async {
    final connected = await context
        .read<ConnectionController>()
        .testConnection();
    if (connected && context.mounted) await _restartStreams(context);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(connected ? 'Server connected.' : 'Connection failed.'),
      ),
    );
  }

  Future<void> _restartStreams(BuildContext context) async {
    final dashboard = context.read<DashboardController>();
    final ecg = context.read<EcgController>();
    await dashboard.start();
    ecg.start();
  }

  Future<void> _clearHistory(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Clear all history?'),
        content: const Text(
          'This permanently deletes all saved wellness reports.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    final success = await context.read<HistoryController>().clear();
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success ? 'History cleared.' : 'Could not clear history.',
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.destructive = false,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final color = destructive
        ? Theme.of(context).colorScheme.error
        : Theme.of(context).colorScheme.primary;
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
        onTap: onTap,
        leading: Icon(icon, color: color),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle),
        trailing: onTap == null
            ? null
            : const Icon(Icons.chevron_right_rounded),
      ),
    );
  }
}
