import 'package:flutter/material.dart';

import '../core/view_state.dart';

class ConnectionBadge extends StatelessWidget {
  const ConnectionBadge({super.key, required this.state});

  final ServerConnectionState state;

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (state) {
      ServerConnectionState.connected => ('Online', const Color(0xFF18856F)),
      ServerConnectionState.connecting => ('Connecting', Colors.orange),
      ServerConnectionState.error => ('Connection error', Colors.red),
      ServerConnectionState.disconnected => ('Offline', Colors.blueGrey),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .1),
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 7),
          Text(
            label,
            style: TextStyle(color: color, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
