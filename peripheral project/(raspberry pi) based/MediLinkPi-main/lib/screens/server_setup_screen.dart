import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../controllers/connection_controller.dart';
import '../core/view_state.dart';
import 'home_screen.dart';

class ServerSetupScreen extends StatefulWidget {
  const ServerSetupScreen({super.key, this.returnToSettings = false});

  final bool returnToSettings;

  @override
  State<ServerSetupScreen> createState() => _ServerSetupScreenState();
}

class _ServerSetupScreenState extends State<ServerSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _hostController;
  late final TextEditingController _portController;
  late final FocusNode _hostFocusNode;
  late final FocusNode _portFocusNode;
  bool _showHelp = false;

  @override
  void initState() {
    super.initState();
    final connection = context.read<ConnectionController>();
    _hostController = TextEditingController(text: connection.host);
    _portController = TextEditingController(text: connection.port.toString());
    _hostFocusNode = FocusNode();
    _portFocusNode = FocusNode();
    _hostController.addListener(_refreshPreview);
    _portController.addListener(_refreshPreview);
  }

  @override
  void dispose() {
    _hostController
      ..removeListener(_refreshPreview)
      ..dispose();
    _portController
      ..removeListener(_refreshPreview)
      ..dispose();
    _hostFocusNode.dispose();
    _portFocusNode.dispose();
    super.dispose();
  }

  void _refreshPreview() => setState(() {});

  String get _endpointPreview {
    final host = _hostController.text.trim();
    final port = _portController.text.trim();
    return 'http://${host.isEmpty ? 'your-pi.local' : host}'
        ':${port.isEmpty ? '8000' : port}';
  }

  Future<void> _pasteEndpoint() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    final value = data?.text?.trim();
    if (value == null || value.isEmpty || !mounted) return;
    _applyEndpoint(value);
  }

  void _applyEndpoint(String value) {
    var candidate = value.trim();
    final uri = Uri.tryParse(
      candidate.contains('://') ? candidate : 'http://$candidate',
    );
    if (uri != null && uri.host.isNotEmpty) {
      _hostController.text = uri.host;
      if (uri.hasPort) {
        _portController.text = uri.port.toString();
      }
    } else {
      _hostController.text = candidate;
    }
    _hostFocusNode.requestFocus();
    _hostController.selection = TextSelection.collapsed(
      offset: _hostController.text.length,
    );
  }

  void _selectHost(String host) {
    _hostController.text = host;
    _portFocusNode.requestFocus();
  }

  void _selectPort(int port) {
    _portController.text = port.toString();
    _portController.selection = TextSelection.collapsed(
      offset: _portController.text.length,
    );
  }

  String? _validateHost(String? value) {
    final host = value?.trim() ?? '';
    if (host.isEmpty) return 'Enter the Pi hostname or IP address';
    if (host.contains(' ')) {
      return 'Hostnames and IP addresses cannot contain spaces';
    }
    final uri = Uri.tryParse(host.contains('://') ? host : 'http://$host');
    if (uri == null || uri.host.isEmpty) {
      return 'Enter a valid hostname or IP address';
    }
    return null;
  }

  String? _validatePort(String? value) {
    final port = int.tryParse(value ?? '');
    if (port == null) return 'Enter a port number';
    if (port < 1 || port > 65535) return 'Port must be between 1 and 65535';
    return null;
  }

  Future<void> _connect() async {
    FocusManager.instance.primaryFocus?.unfocus();
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final host = _hostController.text.trim();
    final port = int.parse(_portController.text);
    final success = await context.read<ConnectionController>().saveAndConnect(
      host,
      port,
    );
    if (!mounted || !success) return;
    if (widget.returnToSettings) {
      Navigator.of(context).pop(true);
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(builder: (_) => const HomeScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final connection = context.watch<ConnectionController>();
    final isConnecting = connection.state == ServerConnectionState.connecting;

    return Scaffold(
      appBar: widget.returnToSettings
          ? AppBar(
              title: const Text(
                'Server connection',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
            )
          : null,
      body: Stack(
        children: [
          const Positioned.fill(child: _BackgroundDecoration()),
          SafeArea(
            top: !widget.returnToSettings,
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 860;
                final showCompactHero =
                    !widget.returnToSettings && constraints.maxHeight >= 700;
                return Center(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.fromLTRB(
                      isWide ? 40 : 20,
                      widget.returnToSettings ? 16 : 28,
                      isWide ? 40 : 20,
                      32,
                    ),
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1040),
                      child: isWide
                          ? Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                const Expanded(child: _SetupHero()),
                                const SizedBox(width: 52),
                                Expanded(
                                  child: _ConnectionCard(
                                    formKey: _formKey,
                                    hostController: _hostController,
                                    portController: _portController,
                                    hostFocusNode: _hostFocusNode,
                                    portFocusNode: _portFocusNode,
                                    endpointPreview: _endpointPreview,
                                    connection: connection,
                                    isConnecting: isConnecting,
                                    showHelp: _showHelp,
                                    validateHost: _validateHost,
                                    validatePort: _validatePort,
                                    onPaste: _pasteEndpoint,
                                    onHostSelected: _selectHost,
                                    onPortSelected: _selectPort,
                                    onToggleHelp: () =>
                                        setState(() => _showHelp = !_showHelp),
                                    onConnect: _connect,
                                  ),
                                ),
                              ],
                            )
                          : Column(
                              children: [
                                if (showCompactHero) ...[
                                  const _CompactHero(),
                                  const SizedBox(height: 24),
                                ],
                                _ConnectionCard(
                                  formKey: _formKey,
                                  hostController: _hostController,
                                  portController: _portController,
                                  hostFocusNode: _hostFocusNode,
                                  portFocusNode: _portFocusNode,
                                  endpointPreview: _endpointPreview,
                                  connection: connection,
                                  isConnecting: isConnecting,
                                  showHelp: _showHelp,
                                  validateHost: _validateHost,
                                  validatePort: _validatePort,
                                  onPaste: _pasteEndpoint,
                                  onHostSelected: _selectHost,
                                  onPortSelected: _selectPort,
                                  onToggleHelp: () =>
                                      setState(() => _showHelp = !_showHelp),
                                  onConnect: _connect,
                                ),
                              ],
                            ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ConnectionCard extends StatelessWidget {
  const _ConnectionCard({
    required this.formKey,
    required this.hostController,
    required this.portController,
    required this.hostFocusNode,
    required this.portFocusNode,
    required this.endpointPreview,
    required this.connection,
    required this.isConnecting,
    required this.showHelp,
    required this.validateHost,
    required this.validatePort,
    required this.onPaste,
    required this.onHostSelected,
    required this.onPortSelected,
    required this.onToggleHelp,
    required this.onConnect,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController hostController;
  final TextEditingController portController;
  final FocusNode hostFocusNode;
  final FocusNode portFocusNode;
  final String endpointPreview;
  final ConnectionController connection;
  final bool isConnecting;
  final bool showHelp;
  final String? Function(String?) validateHost;
  final String? Function(String?) validatePort;
  final VoidCallback onPaste;
  final ValueChanged<String> onHostSelected;
  final ValueChanged<int> onPortSelected;
  final VoidCallback onToggleHelp;
  final VoidCallback onConnect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: .96),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFE4ECF2)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x140B2D42),
            blurRadius: 40,
            offset: Offset(0, 18),
          ),
        ],
      ),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(11),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE4F6F3),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    Icons.hub_rounded,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Connect to your Pi',
                        style: TextStyle(
                          color: Color(0xFF102A43),
                          fontSize: 21,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      SizedBox(height: 3),
                      Text(
                        'Enter the address of your MediLink server',
                        style: TextStyle(color: Color(0xFF627D98)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            TextFormField(
              controller: hostController,
              focusNode: hostFocusNode,
              validator: validateHost,
              autocorrect: false,
              keyboardType: TextInputType.url,
              textInputAction: TextInputAction.next,
              onFieldSubmitted: (_) => portFocusNode.requestFocus(),
              decoration: InputDecoration(
                labelText: 'Pi hostname or IP',
                hintText: '192.168.1.199',
                prefixIcon: const Icon(Icons.dns_outlined),
                suffixIcon: IconButton(
                  tooltip: 'Paste address',
                  onPressed: onPaste,
                  icon: const Icon(Icons.content_paste_rounded),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _QuickChip(
                  label: 'medipi.local',
                  onTap: () => onHostSelected('medipi.local'),
                ),
                _QuickChip(
                  label: '192.168.1.199',
                  onTap: () => onHostSelected('192.168.1.199'),
                ),
                _QuickChip(
                  label: 'localhost',
                  onTap: () => onHostSelected('localhost'),
                ),
              ],
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: portController,
              focusNode: portFocusNode,
              validator: validatePort,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.done,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onFieldSubmitted: (_) {
                if (!isConnecting) onConnect();
              },
              decoration: const InputDecoration(
                labelText: 'Server port',
                hintText: '8000',
                prefixIcon: Icon(Icons.settings_ethernet_rounded),
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: [
                _QuickChip(label: '8000', onTap: () => onPortSelected(8000)),
                _QuickChip(label: '8080', onTap: () => onPortSelected(8080)),
                _QuickChip(label: '5000', onTap: () => onPortSelected(5000)),
              ],
            ),
            const SizedBox(height: 20),
            _EndpointPreview(endpoint: endpointPreview),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 240),
              child: connection.errorMessage == null
                  ? const SizedBox.shrink()
                  : Padding(
                      key: ValueKey(connection.errorMessage),
                      padding: const EdgeInsets.only(top: 16),
                      child: _StatusMessage(
                        icon: Icons.cloud_off_rounded,
                        message: connection.errorMessage!,
                        color: theme.colorScheme.error,
                      ),
                    ),
            ),
            const SizedBox(height: 22),
            FilledButton.icon(
              onPressed: isConnecting ? null : onConnect,
              icon: isConnecting
                  ? const SizedBox(
                      width: 19,
                      height: 19,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.arrow_forward_rounded),
              label: Text(
                isConnecting ? 'Testing connection…' : 'Test, save & connect',
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: onToggleHelp,
              icon: Icon(
                showHelp
                    ? Icons.expand_less_rounded
                    : Icons.help_outline_rounded,
              ),
              label: Text(showHelp ? 'Hide connection help' : 'Need help?'),
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 260),
              curve: Curves.easeOutCubic,
              child: showHelp
                  ? const _ConnectionHelp()
                  : const SizedBox(width: double.infinity),
            ),
          ],
        ),
      ),
    );
  }
}

class _CompactHero extends StatelessWidget {
  const _CompactHero();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00897B), Color(0xFF2E86AB)],
            ),
            borderRadius: BorderRadius.circular(22),
            boxShadow: const [
              BoxShadow(
                color: Color(0x3300897B),
                blurRadius: 24,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: const Icon(
            Icons.monitor_heart_rounded,
            color: Colors.white,
            size: 38,
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'MediLink',
          style: TextStyle(
            color: Color(0xFF102A43),
            fontSize: 30,
            fontWeight: FontWeight.w900,
            letterSpacing: -.8,
          ),
        ),
        const SizedBox(height: 5),
        const Text(
          'Your health data. Private, local, live.',
          textAlign: TextAlign.center,
          style: TextStyle(color: Color(0xFF627D98), fontSize: 15),
        ),
      ],
    );
  }
}

class _SetupHero extends StatelessWidget {
  const _SetupHero();

  @override
  Widget build(BuildContext context) {
    return const Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _BrandMark(),
        SizedBox(height: 34),
        Text(
          'A healthier picture,\nright from your Pi.',
          style: TextStyle(
            color: Color(0xFF102A43),
            fontSize: 42,
            height: 1.08,
            fontWeight: FontWeight.w900,
            letterSpacing: -1.4,
          ),
        ),
        SizedBox(height: 16),
        Text(
          'Connect securely on your local network to view live vitals, '
          'ECG signals, and reading history in one calm dashboard.',
          style: TextStyle(
            color: Color(0xFF486581),
            fontSize: 17,
            height: 1.55,
          ),
        ),
        SizedBox(height: 32),
        _SetupStep(
          number: '1',
          title: 'Join the same network',
          description: 'Connect this device to your Pi hotspot or Wi-Fi.',
        ),
        SizedBox(height: 18),
        _SetupStep(
          number: '2',
          title: 'Enter the server address',
          description: 'Use the Pi hostname, IP address, and API port.',
        ),
        SizedBox(height: 18),
        _SetupStep(
          number: '3',
          title: 'Start monitoring',
          description: 'We will verify the server before opening MediLink.',
        ),
      ],
    );
  }
}

class _BrandMark extends StatelessWidget {
  const _BrandMark();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF00897B), Color(0xFF2E86AB)],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(
            Icons.monitor_heart_rounded,
            color: Colors.white,
            size: 27,
          ),
        ),
        const SizedBox(width: 13),
        const Text(
          'MediLink',
          style: TextStyle(
            color: Color(0xFF102A43),
            fontSize: 25,
            fontWeight: FontWeight.w900,
            letterSpacing: -.5,
          ),
        ),
      ],
    );
  }
}

class _SetupStep extends StatelessWidget {
  const _SetupStep({
    required this.number,
    required this.title,
    required this.description,
  });

  final String number;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 34,
          height: 34,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFFB9E4DE)),
          ),
          child: Text(
            number,
            style: const TextStyle(
              color: Color(0xFF00897B),
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFF243B53),
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                description,
                style: const TextStyle(color: Color(0xFF627D98), height: 1.4),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _QuickChip extends StatelessWidget {
  const _QuickChip({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ActionChip(
      onPressed: onTap,
      avatar: const Icon(Icons.add_rounded, size: 16),
      label: Text(label),
      visualDensity: VisualDensity.compact,
      side: const BorderSide(color: Color(0xFFD9E2EC)),
      backgroundColor: const Color(0xFFF8FAFC),
      labelStyle: const TextStyle(
        color: Color(0xFF486581),
        fontSize: 12,
        fontWeight: FontWeight.w700,
      ),
    );
  }
}

class _EndpointPreview extends StatelessWidget {
  const _EndpointPreview({required this.endpoint});

  final String endpoint;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F7FA),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD9E2EC)),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: Color(0xFF27AB83),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 10),
          const Text(
            'Endpoint',
            style: TextStyle(
              color: Color(0xFF829AB1),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              endpoint,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: Color(0xFF243B53),
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusMessage extends StatelessWidget {
  const _StatusMessage({
    required this.icon,
    required this.message,
    required this.color,
  });

  final IconData icon;
  final String message;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .07),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: .18)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(message, style: TextStyle(color: color, height: 1.35)),
          ),
        ],
      ),
    );
  }
}

class _ConnectionHelp extends StatelessWidget {
  const _ConnectionHelp();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFAEB),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFF8DFA1)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _HelpLine(
            icon: Icons.wifi_rounded,
            text: 'Confirm this device and the Pi are on the same network.',
          ),
          SizedBox(height: 11),
          _HelpLine(
            icon: Icons.terminal_rounded,
            text: 'Check that the MediLink server is running on the Pi.',
          ),
          SizedBox(height: 11),
          _HelpLine(
            icon: Icons.security_rounded,
            text: 'Local HTTP is intended only for a trusted private network.',
          ),
        ],
      ),
    );
  }
}

class _HelpLine extends StatelessWidget {
  const _HelpLine({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: const Color(0xFFB7791F)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: Color(0xFF7C5B18),
              fontSize: 13,
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }
}

class _BackgroundDecoration extends StatelessWidget {
  const _BackgroundDecoration();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: ClipRect(
        child: Stack(
          children: [
            const Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Color(0xFFF1FAF8),
                      Color(0xFFF3F7FA),
                      Color(0xFFEEF5FA),
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              top: -130,
              right: -90,
              child: Container(
                width: 330,
                height: 330,
                decoration: const BoxDecoration(
                  color: Color(0x142E86AB),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              bottom: -150,
              left: -100,
              child: Container(
                width: 360,
                height: 360,
                decoration: const BoxDecoration(
                  color: Color(0x1200897B),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
