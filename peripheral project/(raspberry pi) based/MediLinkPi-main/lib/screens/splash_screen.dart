import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../controllers/connection_controller.dart';
import 'home_screen.dart';
import 'server_setup_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _continue());
  }

  Future<void> _continue() async {
    final connection = context.read<ConnectionController>();
    if (!connection.hasSavedServer) {
      await Future<void>.delayed(const Duration(milliseconds: 700));
      if (mounted) _replace(const ServerSetupScreen());
      return;
    }
    final connected = await connection.testConnection();
    if (!mounted) return;
    _replace(connected ? const HomeScreen() : const ServerSetupScreen());
  }

  void _replace(Widget screen) {
    Navigator.of(
      context,
    ).pushReplacement(MaterialPageRoute<void>(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(28),
              ),
              child: const Icon(
                Icons.monitor_heart_rounded,
                color: Colors.white,
                size: 54,
              ),
            ),
            const SizedBox(height: 22),
            Text(
              'MediLink',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.w900,
                color: const Color(0xFF102A43),
              ),
            ),
            const SizedBox(height: 7),
            const Text('Personal health monitoring'),
            const SizedBox(height: 30),
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2.5),
            ),
          ],
        ),
      ),
    );
  }
}
