import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

import 'controllers/connection_controller.dart';
import 'controllers/dashboard_controller.dart';
import 'controllers/ecg_controller.dart';
import 'controllers/history_controller.dart';
import 'repositories/medilink_repository.dart';
import 'screens/splash_screen.dart';
import 'services/api_service.dart';
import 'services/server_config_service.dart';
import 'services/websocket_service.dart';

class MediLinkApp extends StatelessWidget {
  const MediLinkApp({
    super.key,
    required this.config,
    this.httpClient,
    this.webSocketService,
  });

  final ServerConfigService config;
  final http.Client? httpClient;
  final WebSocketService? webSocketService;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider.value(value: config),
        Provider(
          create: (_) => ApiService(config, client: httpClient),
          dispose: (_, service) => service.dispose(),
        ),
        Provider(create: (_) => webSocketService ?? WebSocketService(config)),
        ProxyProvider2<ApiService, WebSocketService, MediLinkRepository>(
          update: (_, api, socket, previous) => MediLinkRepository(api, socket),
        ),
        ChangeNotifierProxyProvider<MediLinkRepository, ConnectionController>(
          create: (context) =>
              ConnectionController(config, context.read<MediLinkRepository>()),
          update: (_, repository, previous) =>
              previous ?? ConnectionController(config, repository),
        ),
        ChangeNotifierProxyProvider<MediLinkRepository, DashboardController>(
          create: (context) =>
              DashboardController(context.read<MediLinkRepository>()),
          update: (_, repository, previous) =>
              previous ?? DashboardController(repository),
        ),
        ChangeNotifierProxyProvider<MediLinkRepository, EcgController>(
          create: (context) =>
              EcgController(context.read<MediLinkRepository>()),
          update: (_, repository, previous) =>
              previous ?? EcgController(repository),
        ),
        ChangeNotifierProxyProvider<MediLinkRepository, HistoryController>(
          create: (context) =>
              HistoryController(context.read<MediLinkRepository>()),
          update: (_, repository, previous) =>
              previous ?? HistoryController(repository),
        ),
      ],
      child: MaterialApp(
        title: 'MediLink',
        debugShowCheckedModeBanner: false,
        theme: _theme(),
        home: const SplashScreen(),
      ),
    );
  }

  ThemeData _theme() {
    const navy = Color(0xFF102A43);
    const teal = Color(0xFF00897B);
    final scheme = ColorScheme.fromSeed(
      seedColor: teal,
      brightness: Brightness.light,
      primary: teal,
      secondary: const Color(0xFF2E86AB),
      surface: const Color(0xFFF8FAFC),
      error: const Color(0xFFD64550),
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: const Color(0xFFF3F7FA),
      fontFamily: 'sans-serif',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: navy,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFD9E2EC)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: teal, width: 2),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
        ),
      ),
      navigationBarTheme: const NavigationBarThemeData(
        backgroundColor: Colors.white,
        indicatorColor: Color(0xFFD9F3EF),
        height: 72,
      ),
    );
  }
}
