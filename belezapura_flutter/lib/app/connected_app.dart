import 'package:flutter/material.dart';
import '../core/api_client.dart';
import '../theme/app_theme.dart';
import 'owner_pages.dart';
import 'public_pages.dart';
import 'admin_pages.dart';

String money(dynamic value) =>
    'R\$ ${((value is num ? value : num.tryParse(value.toString())) ?? 0).toStringAsFixed(2).replaceAll('.', ',')}';
Map<String, dynamic> object(dynamic value) =>
    Map<String, dynamic>.from(value as Map);
List<Map<String, dynamic>> objects(dynamic value) =>
    (value as List).map(object).toList();

class BelezaPuraApp extends StatefulWidget {
  final ApiClient? api;
  const BelezaPuraApp({super.key, this.api});
  @override
  State<BelezaPuraApp> createState() => _BelezaPuraAppState();
}

class _BelezaPuraAppState extends State<BelezaPuraApp> {
  late final ApiClient api = widget.api ?? ApiClient();
  final navigator = GlobalKey<NavigatorState>();
  @override
  void initState() {
    super.initState();
    api.onUnauthorized = () {
      navigator.currentState?.pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => EntryPage(api: api)),
        (_) => false,
      );
    };
  }

  @override
  void dispose() {
    api.onUnauthorized = null;
    if (widget.api == null) api.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'BelezaPura',
    navigatorKey: navigator,
    theme: AppTheme.lightTheme,
    debugShowCheckedModeBanner: false,
    home: EntryPage(api: api),
  );
}

class EntryPage extends StatefulWidget {
  final ApiClient api;
  const EntryPage({super.key, required this.api});
  @override
  State<EntryPage> createState() => _EntryPageState();
}

class _EntryPageState extends State<EntryPage> {
  final email = TextEditingController();
  final password = TextEditingController();
  final slug = TextEditingController();
  bool busy = false;
  String? error;
  @override
  void dispose() {
    email.dispose();
    password.dispose();
    slug.dispose();
    super.dispose();
  }

  Future<void> login() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await widget.api.login(email.text, password.text);
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => WorkspacePage(api: widget.api)),
      );
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.spa_outlined,
                  color: AppTheme.primary,
                  size: 48,
                ),
                const SizedBox(height: 12),
                Text(
                  'BelezaPura',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Gestão do seu salão, em qualquer lugar.',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),
                if (!widget.api.configured)
                  const Notice(
                    'A API do aplicativo ainda não foi configurada. O build de distribuição exige API_BASE_URL com HTTPS.',
                  ),
                if (error != null) Notice(error!),
                TextField(
                  controller: email,
                  keyboardType: TextInputType.emailAddress,
                  autofillHints: const [AutofillHints.username],
                  decoration: const InputDecoration(labelText: 'E-mail'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: password,
                  obscureText: true,
                  autofillHints: const [AutofillHints.password],
                  decoration: const InputDecoration(labelText: 'Senha'),
                  onSubmitted: (_) {
                    if (!busy) login();
                  },
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: busy || !widget.api.configured ? null : login,
                  child: Text(busy ? 'Entrando...' : 'Entrar'),
                ),
                TextButton(
                  onPressed: busy || !widget.api.configured
                      ? null
                      : () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => SignupPage(api: widget.api),
                          ),
                        ),
                  child: const Text('Criar salão e testar por 14 dias'),
                ),
                const Divider(height: 36),
                const Text(
                  'Quer agendar um atendimento?',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: slug,
                  decoration: const InputDecoration(
                    labelText: 'Identificador ou link do salão',
                  ),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: !widget.api.configured
                      ? null
                      : () {
                          final input = slug.text.trim();
                          final uri = Uri.tryParse(input);
                          final target = uri != null && uri.hasScheme
                              ? uri.pathSegments.lastOrNull ?? ''
                              : input;
                          if (target.isNotEmpty) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PublicBookingPage(
                                  api: widget.api,
                                  slug: target,
                                ),
                              ),
                            );
                          }
                        },
                  child: const Text('Ver serviços e horários'),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

class WorkspacePage extends StatefulWidget {
  final ApiClient api;
  const WorkspacePage({super.key, required this.api});
  @override
  State<WorkspacePage> createState() => _WorkspacePageState();
}

class _WorkspacePageState extends State<WorkspacePage> {
  int selected = 0;
  bool get admin => widget.api.user?['role'] == 'superadmin';
  List<String> get labels => admin
      ? ['Visão geral', 'Assinaturas', 'Recebimentos', 'Salões', 'Auditoria']
      : [
          'Resumo',
          'Agendamentos',
          'Clientes',
          'Serviços',
          'Profissionais',
          'Estoque',
          'Horários',
          'Assinatura',
          'Configurações',
        ];
  Widget content() {
    if (admin) {
      switch (selected) {
        case 0:
          return DashboardPage(api: widget.api, admin: true);
        case 1:
          return AdminSubscriptionsPage(api: widget.api);
        case 2:
          return ReadOnlyListPage(
            api: widget.api,
            path: '/superadmin/payments',
            titleField: 'reference',
            detail: (row) => '${money(row['amount'])}\n${row['createdAt']}',
          );
        case 3:
          return ReadOnlyListPage(
            api: widget.api,
            path: '/superadmin/salons',
            titleField: 'name',
            detail: (row) => '${row['plan']} • ${row['status']}',
          );
        default:
          return ReadOnlyListPage(
            api: widget.api,
            path: '/superadmin/audit-logs',
            titleField: 'action',
            detail: (row) => '${row['detail']}',
          );
      }
    }
    switch (selected) {
      case 0:
        return DashboardPage(api: widget.api);
      case 1:
        return AppointmentsPage(api: widget.api);
      case 2:
        return EntityPage(api: widget.api, kind: EntityKind.clients);
      case 3:
        return EntityPage(api: widget.api, kind: EntityKind.services);
      case 4:
        return EntityPage(api: widget.api, kind: EntityKind.professionals);
      case 5:
        return EntityPage(api: widget.api, kind: EntityKind.products);
      case 6:
        return HoursPage(api: widget.api);
      case 7:
        return SubscriptionPage(api: widget.api);
      default:
        return SettingsPage(api: widget.api);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(labels[selected]),
      actions: [
        IconButton(
          tooltip: 'Sair',
          icon: const Icon(Icons.logout),
          onPressed: () {
            widget.api.clearSession();
            Navigator.pushAndRemoveUntil(
              context,
              MaterialPageRoute(builder: (_) => EntryPage(api: widget.api)),
              (_) => false,
            );
          },
        ),
      ],
    ),
    drawer: Drawer(
      child: SafeArea(
        child: Column(
          children: [
            ListTile(
              title: const Text('BelezaPura'),
              subtitle: Text(widget.api.user?['name']?.toString() ?? ''),
            ),
            Expanded(
              child: ListView(
                children: labels.indexed
                    .map(
                      (item) => ListTile(
                        selected: selected == item.$1,
                        title: Text(item.$2),
                        onTap: () {
                          setState(() => selected = item.$1);
                          Navigator.pop(context);
                        },
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    ),
    body: KeyedSubtree(key: ValueKey(selected), child: content()),
  );
}

class Notice extends StatelessWidget {
  final String text;
  const Notice(this.text, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Semantics(
      liveRegion: true,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.secondary,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(text),
      ),
    ),
  );
}

class DataPage extends StatefulWidget {
  final ApiClient api;
  final String path;
  final Widget Function(BuildContext, dynamic, Future<void> Function()) builder;
  const DataPage({
    super.key,
    required this.api,
    required this.path,
    required this.builder,
  });
  @override
  State<DataPage> createState() => _DataPageState();
}

class _DataPageState extends State<DataPage> {
  dynamic data;
  String? error;
  bool loading = true;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final result = await widget.api.request('GET', widget.path);
      if (mounted) {
        setState(() {
          data = result;
          error = null;
          loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          error = e.toString();
          loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Notice(error!),
              FilledButton(
                onPressed: load,
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: load,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: widget.builder(context, data, load),
      ),
    );
  }
}

class DashboardPage extends StatelessWidget {
  final ApiClient api;
  final bool admin;
  const DashboardPage({super.key, required this.api, this.admin = false});
  @override
  Widget build(BuildContext context) => DataPage(
    api: api,
    path: admin ? '/superadmin/overview' : '/salon/dashboard',
    builder: (context, value, reload) {
      final data = object(value);
      final items = admin
          ? {
              'Salões': data['totalSalons'],
              'Agendamentos': data['totalAppointments'],
              'Clientes': data['totalClients'],
            }
          : {
              'Agendamentos hoje': data['appointmentsToday'],
              'Receita de concluídos no mês': money(data['monthlyRevenue']),
              'Clientes': data['totalClients'],
              'Profissionais': data['totalProfessionals'],
            };
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Olá, ${api.user?['name'] ?? ''}',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 20),
          ...items.entries.map(
            (e) => Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(e.key),
                    const SizedBox(height: 8),
                    Text(
                      '${e.value ?? 0}',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (!admin)
            const Notice(
              'Use o menu para acompanhar reservas, cadastrar serviços e gerenciar sua assinatura.',
            ),
        ],
      );
    },
  );
}

class ReadOnlyListPage extends StatelessWidget {
  final ApiClient api;
  final String path;
  final String titleField;
  final String Function(Map<String, dynamic>) detail;
  const ReadOnlyListPage({
    super.key,
    required this.api,
    required this.path,
    required this.titleField,
    required this.detail,
  });
  @override
  Widget build(BuildContext context) => DataPage(
    api: api,
    path: path,
    builder: (context, data, reload) {
      final rows = objects(data);
      return Column(
        children: [
          if (rows.isEmpty) const Notice('Nenhum registro encontrado.'),
          ...rows.map(
            (row) => Card(
              child: ListTile(
                title: Text('${row[titleField] ?? ''}'),
                subtitle: Text(detail(row)),
              ),
            ),
          ),
        ],
      );
    },
  );
}

Future<Map<String, String>?> editFields(
  BuildContext context,
  String title,
  Map<String, String> values, {
  Set<String> numeric = const {},
  Set<String> optional = const {},
}) async {
  final controllers = values.map(
    (key, value) => MapEntry(key, TextEditingController(text: value)),
  );
  final form = GlobalKey<FormState>();
  final result = await showDialog<Map<String, String>>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: SizedBox(
        width: 420,
        child: SingleChildScrollView(
          child: Form(
            key: form,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: controllers.entries
                  .map(
                    (entry) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: TextFormField(
                        controller: entry.value,
                        decoration: InputDecoration(labelText: entry.key),
                        keyboardType: numeric.contains(entry.key)
                            ? const TextInputType.numberWithOptions(
                                decimal: true,
                              )
                            : TextInputType.text,
                        validator: (text) {
                          if ((text ?? '').trim().isEmpty &&
                              !optional.contains(entry.key)) {
                            return 'Informe este campo.';
                          }
                          if (numeric.contains(entry.key) &&
                              num.tryParse((text ?? '').replaceAll(',', '.')) ==
                                  null) {
                            return 'Informe um número válido.';
                          }
                          return null;
                        },
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancelar'),
        ),
        FilledButton(
          onPressed: () {
            if (form.currentState!.validate()) {
              Navigator.pop(
                context,
                controllers.map((key, c) => MapEntry(key, c.text.trim())),
              );
            }
          },
          child: const Text('Salvar'),
        ),
      ],
    ),
  );
  // Dialog route remains mounted during its closing animation.
  await Future<void>.delayed(const Duration(milliseconds: 250));
  for (final controller in controllers.values) {
    controller.dispose();
  }
  return result;
}

Future<bool> confirmAction(BuildContext context, String message) async =>
    await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar ação'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Voltar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    ) ??
    false;
void showFailure(BuildContext context, Object error) {
  ScaffoldMessenger.of(
    context,
  ).showSnackBar(SnackBar(content: Text(error.toString())));
}
