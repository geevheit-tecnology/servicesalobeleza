import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/api_client.dart';
import 'connected_app.dart';
import 'owner_pages.dart';

class PublicBookingPage extends StatefulWidget {
  final ApiClient api;
  final String slug;
  const PublicBookingPage({super.key, required this.api, required this.slug});
  @override
  State<PublicBookingPage> createState() => _PublicBookingPageState();
}

class _PublicBookingPageState extends State<PublicBookingPage> {
  Map<String, dynamic>? salon;
  String? service;
  String? pro;
  DateTime? date;
  String? slot;
  Map<String, dynamic> slots = {};
  Map<String, dynamic>? result;
  final name = TextEditingController();
  final phone = TextEditingController();
  bool busy = false;
  bool loadingSlots = false;
  int slotRequest = 0;
  String? error;
  @override
  void initState() {
    super.initState();
    load();
  }

  @override
  void dispose() {
    name.dispose();
    phone.dispose();
    super.dispose();
  }

  Future<void> load() async {
    try {
      final data = await widget.api.request(
        'GET',
        '/public/salons/${Uri.encodeComponent(widget.slug)}',
      );
      if (mounted) setState(() => salon = object(data));
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> loadSlots() async {
    final request = ++slotRequest;
    setState(() {
      slots = {};
      slot = null;
      error = null;
    });
    if (date == null || service == null || pro == null) return;
    setState(() => loadingSlots = true);
    try {
      final data = await widget.api.request(
        'GET',
        '/public/availability',
        query: {
          'salonId': '${salon!['id']}',
          'professionalId': pro!,
          'serviceId': service!,
          'date': dateString(date!),
        },
      );
      if (mounted && request == slotRequest) {
        setState(() => slots = object(data['slots']));
      }
    } catch (e) {
      if (mounted && request == slotRequest) {
        setState(() => error = e.toString());
      }
    } finally {
      if (mounted && request == slotRequest) {
        setState(() => loadingSlots = false);
      }
    }
  }

  Future<void> reserve() async {
    if (slot == null || busy) return;
    if (name.text.trim().isEmpty ||
        phone.text.replaceAll(RegExp(r'\D'), '').length < 10) {
      setState(() => error = 'Informe seu nome e telefone com DDD.');
      return;
    }
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final data = await widget.api.request(
        'POST',
        '/public/appointments',
        body: {
          'salonId': salon!['id'],
          'serviceId': service,
          'professionalId': pro,
          'date': slots[slot],
          'clientName': name.text.trim(),
          'clientPhone': phone.text.trim(),
        },
      );
      if (mounted) setState(() => result = object(data));
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text('${salon?['name'] ?? 'Agendar atendimento'}')),
    body: ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (error != null) Notice(error!),
        if (salon == null && error == null)
          const Center(child: CircularProgressIndicator()),
        if (salon == null && error != null)
          OutlinedButton(
            onPressed: load,
            child: const Text('Tentar novamente'),
          ),
        if (result != null) ...[
          const Icon(Icons.check_circle_outline, size: 60, color: Colors.green),
          Text(
            'Reserva registrada',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const Notice(
            'Aguarde a conferência do salão. O registro da reserva não confirma o recebimento do Pix.',
          ),
          if ('${result!['pixCode'] ?? ''}'.isNotEmpty) ...[
            Text('Sinal: ${money(result!['deposit'])}'),
            const SizedBox(height: 12),
            SelectableText('${result!['pixCode']}'),
            FilledButton.icon(
              onPressed: () => Clipboard.setData(
                ClipboardData(text: '${result!['pixCode']}'),
              ),
              icon: const Icon(Icons.copy),
              label: const Text('Copiar Pix Copia e Cola'),
            ),
          ],
          OutlinedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Concluir'),
          ),
        ] else if (salon != null) ...[
          selection('Serviço', objects(salon!['services']), service, (value) {
            service = value;
            loadSlots();
          }),
          selection('Profissional', objects(salon!['professionals']), pro, (
            value,
          ) {
            pro = value;
            loadSlots();
          }),
          OutlinedButton(
            onPressed: busy
                ? null
                : () async {
                    final selected = await showDatePicker(
                      context: context,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (selected != null) {
                      date = selected;
                      loadSlots();
                    }
                  },
            child: Text(date == null ? 'Escolher data' : dateString(date!)),
          ),
          Text('Horários no fuso ${salon!['timezone']}'),
          if (loadingSlots) const Center(child: CircularProgressIndicator()),
          Wrap(
            spacing: 8,
            children: slots.keys
                .map(
                  (label) => ChoiceChip(
                    label: Text(label),
                    selected: slot == label,
                    onSelected: busy
                        ? null
                        : (_) => setState(() => slot = label),
                  ),
                )
                .toList(),
          ),
          if (date != null && !loadingSlots && slots.isEmpty)
            const Notice(
              'Selecione serviço e profissional. Se não houver horários, escolha outra data.',
            ),
          const SizedBox(height: 20),
          TextField(
            controller: name,
            decoration: const InputDecoration(labelText: 'Seu nome'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Telefone com DDD'),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: busy || slot == null ? null : reserve,
            child: Text(busy ? 'Registrando...' : 'Registrar reserva'),
          ),
        ],
      ],
    ),
  );
}

class SignupPage extends StatefulWidget {
  final ApiClient api;
  const SignupPage({super.key, required this.api});
  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final form = GlobalKey<FormState>();
  final fields = <String, TextEditingController>{
    for (final key in [
      'Nome do salão',
      'E-mail',
      'Senha',
      'CPF/CNPJ',
      'Telefone',
      'Chave Pix',
      'Nome do serviço',
      'Preço',
      'Duração em minutos',
      'Nome do profissional',
    ])
      key: TextEditingController(),
  };
  List<Map<String, dynamic>> plans = [];
  String? plan;
  String? error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    loadPlans();
    fields['Duração em minutos']!.text = '60';
  }

  Future<void> loadPlans() async {
    try {
      final data = await widget.api.request('GET', '/public/plans');
      if (mounted) setState(() => plans = objects(data));
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  @override
  void dispose() {
    for (final field in fields.values) {
      field.dispose();
    }
    super.dispose();
  }

  Future<void> submit() async {
    if (busy || !form.currentState!.validate() || plan == null) return;
    setState(() {
      busy = true;
      error = null;
    });
    String value(String key) => fields[key]!.text.trim();
    try {
      final data = await widget.api.request(
        'POST',
        '/public/onboarding',
        body: {
          'salonName': value('Nome do salão'),
          'email': value('E-mail'),
          'password': fields['Senha']!.text,
          'document': value('CPF/CNPJ'),
          'phone': value('Telefone'),
          'pixKey': value('Chave Pix'),
          'planId': plan,
          'services': [
            {
              'name': value('Nome do serviço'),
              'price': value('Preço'),
              'duration': value('Duração em minutos'),
            },
          ],
          'professionals': [
            {'name': value('Nome do profissional')},
          ],
          'schedule':
              [
                    'Segunda',
                    'Terça',
                    'Quarta',
                    'Quinta',
                    'Sexta',
                    'Sábado',
                    'Domingo',
                  ].indexed
                  .map(
                    (item) => {
                      'day': item.$2,
                      'open': item.$1 < 6,
                      'start': '09:00',
                      'end': '19:00',
                    },
                  )
                  .toList(),
        },
      );
      widget.api.acceptSession(object(data));
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => WorkspacePage(api: widget.api)),
          (_) => false,
        );
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Criar salão')),
    body: Form(
      key: form,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Notice(
            'Teste por 14 dias sem cartão. Para continuar, solicite o plano e combine o pagamento com o administrador. O expediente inicial será de segunda a sábado, das 9h às 19h; ajuste no painel.',
          ),
          if (error != null) Notice(error!),
          selection(
            'Plano',
            plans,
            plan,
            (value) => setState(() => plan = value),
          ),
          ...fields.entries.map(
            (entry) => Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: TextFormField(
                controller: entry.value,
                obscureText: entry.key == 'Senha',
                keyboardType: entry.key == 'E-mail'
                    ? TextInputType.emailAddress
                    : ['Preço', 'Duração em minutos'].contains(entry.key)
                    ? const TextInputType.numberWithOptions(decimal: true)
                    : TextInputType.text,
                decoration: InputDecoration(labelText: entry.key),
                validator: (text) {
                  if (['CPF/CNPJ', 'Chave Pix'].contains(entry.key)) {
                    return null;
                  }
                  if ((text ?? '').trim().isEmpty) return 'Informe este campo.';
                  if (entry.key == 'Senha' && text!.length < 12) {
                    return 'Use pelo menos 12 caracteres.';
                  }
                  return null;
                },
              ),
            ),
          ),
          FilledButton(
            onPressed: busy || plan == null ? null : submit,
            child: Text(busy ? 'Cadastrando...' : 'Iniciar teste gratuito'),
          ),
        ],
      ),
    ),
  );
}
