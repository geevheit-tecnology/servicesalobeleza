import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/api_client.dart';
import 'connected_app.dart';

enum EntityKind { clients, services, professionals, products }

class EntityPage extends StatefulWidget {
  final ApiClient api;
  final EntityKind kind;
  const EntityPage({super.key, required this.api, required this.kind});
  @override
  State<EntityPage> createState() => _EntityPageState();
}

class _EntityPageState extends State<EntityPage> {
  bool busy = false;
  String get path => switch (widget.kind) {
    EntityKind.clients => '/salon/clients',
    EntityKind.services => '/services',
    EntityKind.professionals => '/professionals',
    EntityKind.products => '/salon/products',
  };
  String get singular => switch (widget.kind) {
    EntityKind.clients => 'cliente',
    EntityKind.services => 'serviço',
    EntityKind.professionals => 'profissional',
    EntityKind.products => 'produto',
  };
  Future<void> edit(
    Map<String, dynamic>? row,
    Future<void> Function() reload,
  ) async {
    final values = <String, String>{
      'Nome':
          '${row?[widget.kind == EntityKind.products ? 'nome' : 'name'] ?? ''}',
    };
    switch (widget.kind) {
      case EntityKind.clients:
        values['Telefone'] = '${row?['phone'] ?? ''}';
      case EntityKind.services:
        values.addAll({
          'Preço': '${row?['price'] ?? 0}',
          'Duração em minutos': '${row?['duration'] ?? 30}',
        });
      case EntityKind.professionals:
        values.addAll({
          'Especialidade': '${row?['specialty'] ?? ''}',
          'Comissão percentual': '${row?['commission'] ?? 0}',
        });
      case EntityKind.products:
        values.addAll({
          'Categoria': '${row?['categoria'] ?? 'Geral'}',
          'Quantidade': '${row?['qtde'] ?? 0}',
          'Mínimo': '${row?['min'] ?? 0}',
          'Preço': '${row?['price'] ?? 0}',
        });
    }
    final input = await editFields(
      context,
      '${row == null ? 'Novo' : 'Editar'} $singular',
      values,
      numeric: {
        'Preço',
        'Duração em minutos',
        'Comissão percentual',
        'Quantidade',
        'Mínimo',
      },
      optional: {'Telefone', 'Especialidade'},
    );
    if (input == null || !mounted) return;
    num number(String key) => num.parse(input[key]!.replaceAll(',', '.'));
    final body = <String, dynamic>{'name': input['Nome']};
    switch (widget.kind) {
      case EntityKind.clients:
        body['phone'] = input['Telefone'];
      case EntityKind.services:
        body.addAll({
          'price': number('Preço'),
          'duration': number('Duração em minutos'),
        });
      case EntityKind.professionals:
        body.addAll({
          'specialty': input['Especialidade'],
          'commission': number('Comissão percentual'),
        });
      case EntityKind.products:
        body.clear();
        body.addAll({
          'nome': input['Nome'],
          'categoria': input['Categoria'],
          'qtde': number('Quantidade'),
          'min': number('Mínimo'),
          'price': number('Preço'),
          'usoInterno': row?['usoInterno'] ?? true,
          'venda': row?['venda'] ?? false,
          'version': row?['version'],
        });
    }
    setState(() => busy = true);
    try {
      await widget.api.request(
        row == null ? 'POST' : 'PUT',
        '$path${row == null ? '' : '/${row['id']}'}',
        body: body,
      );
      await reload();
    } catch (e) {
      if (mounted) showFailure(context, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> remove(
    Map<String, dynamic> row,
    Future<void> Function() reload, {
    bool inactive = false,
  }) async {
    if (!await confirmAction(
      context,
      inactive
          ? 'Alternar o estado deste $singular?'
          : 'Excluir este $singular?',
    )) {
      return;
    }
    setState(() => busy = true);
    try {
      await widget.api.request(
        'DELETE',
        '$path/${row['id']}',
        query: inactive ? {'mode': 'inactive'} : null,
      );
      await reload();
    } catch (e) {
      if (mounted) showFailure(context, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => DataPage(
    api: widget.api,
    path:
        widget.kind == EntityKind.services ||
            widget.kind == EntityKind.professionals
        ? '/salon/details'
        : path,
    builder: (context, data, reload) {
      final rows = objects(
        widget.kind == EntityKind.services
            ? data['services']
            : widget.kind == EntityKind.professionals
            ? data['professionals']
            : data,
      );
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          FilledButton.icon(
            onPressed: busy ? null : () => edit(null, reload),
            icon: const Icon(Icons.add),
            label: Text('Adicionar $singular'),
          ),
          const SizedBox(height: 12),
          if (rows.isEmpty) const Notice('Nenhum registro cadastrado.'),
          ...rows.map((row) {
            final title =
                row[widget.kind == EntityKind.products ? 'nome' : 'name'];
            final status = row['status'] ?? 'active';
            final subtitle = switch (widget.kind) {
              EntityKind.clients => '${row['phone'] ?? 'Sem telefone'}',
              EntityKind.services =>
                '${money(row['price'])} • ${row['duration']} min',
              EntityKind.professionals =>
                '${row['specialty'] ?? ''} • comissão ${row['commission']}%',
              EntityKind.products =>
                '${row['qtde']} unidades • mínimo ${row['min']} • ${money(row['price'])}',
            };
            return Card(
              child: ListTile(
                title: Text('$title'),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(subtitle),
                    Text(
                      status == 'active' ? 'Ativo' : 'Inativo',
                      style: TextStyle(
                        color: status == 'active'
                            ? Colors.green.shade700
                            : Colors.red.shade700,
                      ),
                    ),
                  ],
                ),
                trailing: PopupMenuButton<String>(
                  enabled: !busy,
                  onSelected: (action) {
                    if (action == 'edit') {
                      edit(row, reload);
                    } else {
                      remove(row, reload, inactive: action == 'inactive');
                    }
                  },
                  itemBuilder: (_) => [
                    const PopupMenuItem(value: 'edit', child: Text('Editar')),
                    if (widget.kind != EntityKind.products)
                      const PopupMenuItem(
                        value: 'inactive',
                        child: Text('Alternar ativo/inativo'),
                      ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Text('Excluir'),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      );
    },
  );
}

class AppointmentsPage extends StatelessWidget {
  final ApiClient api;
  const AppointmentsPage({super.key, required this.api});
  Future<void> create(
    BuildContext context,
    Future<void> Function() reload,
  ) async {
    try {
      final details = object(await api.request('GET', '/salon/details'));
      final clients = objects(await api.request('GET', '/salon/clients'));
      if (!context.mounted) return;
      if (clients.isEmpty) {
        showFailure(context, 'Cadastre ao menos um cliente.');
        return;
      }
      final result = await Navigator.push<bool>(
        context,
        MaterialPageRoute(
          builder: (_) =>
              InternalBookingPage(api: api, salon: details, clients: clients),
        ),
      );
      if (result == true) await reload();
    } catch (e) {
      if (context.mounted) showFailure(context, e);
    }
  }

  @override
  Widget build(BuildContext context) => DataPage(
    api: api,
    path: '/appointments',
    builder: (context, data, reload) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        FilledButton.icon(
          onPressed: () => create(context, reload),
          icon: const Icon(Icons.add),
          label: const Text('Novo agendamento'),
        ),
        const Notice(
          'Confirme o atendimento somente após conferir o recebimento combinado com o cliente.',
        ),
        if ((data as List).isEmpty) const Notice('Nenhum agendamento.'),
        ...objects(data).map((row) {
          final date = DateTime.tryParse('${row['date']}')?.toLocal();
          return Card(
            child: ListTile(
              isThreeLine: true,
              title: Text(
                '${row['client']?['name'] ?? 'Cliente'} • ${row['service']?['name'] ?? ''}',
              ),
              subtitle: Text(
                '${date == null ? '' : '${date.day}/${date.month}/${date.year} ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}'}\n${row['professional']?['name'] ?? ''} • ${row['status']} • ${money(row['value'])}',
              ),
              trailing: PopupMenuButton<String>(
                onSelected: (status) async {
                  if (!await confirmAction(
                    context,
                    'Alterar o agendamento para $status?',
                  )) {
                    return;
                  }
                  try {
                    await api.request(
                      'PUT',
                      '/appointments/${row['id']}',
                      body: {'status': status},
                    );
                    await reload();
                  } catch (e) {
                    if (context.mounted) showFailure(context, e);
                  }
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(
                    value: 'confirmed',
                    child: Text('Confirmar após conferência'),
                  ),
                  PopupMenuItem(value: 'done', child: Text('Concluir')),
                  PopupMenuItem(value: 'cancelled', child: Text('Cancelar')),
                ],
              ),
            ),
          );
        }),
      ],
    ),
  );
}

class InternalBookingPage extends StatefulWidget {
  final ApiClient api;
  final Map<String, dynamic> salon;
  final List<Map<String, dynamic>> clients;
  const InternalBookingPage({
    super.key,
    required this.api,
    required this.salon,
    required this.clients,
  });
  @override
  State<InternalBookingPage> createState() => _InternalBookingPageState();
}

class _InternalBookingPageState extends State<InternalBookingPage> {
  String? client;
  String? service;
  String? pro;
  DateTime? date;
  String? slot;
  Map<String, dynamic> slots = {};
  bool busy = false;
  String? error;
  Future<void> loadSlots() async {
    setState(() {
      slots = {};
      slot = null;
      error = null;
    });
    if (date == null || service == null || pro == null) return;
    try {
      final data = await widget.api.request(
        'GET',
        '/public/availability',
        query: {
          'salonId': '${widget.salon['id']}',
          'professionalId': pro!,
          'serviceId': service!,
          'date': dateString(date!),
        },
      );
      if (mounted) setState(() => slots = object(data['slots']));
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> save() async {
    setState(() => busy = true);
    try {
      await widget.api.request(
        'POST',
        '/appointments',
        body: {
          'clientId': client,
          'serviceId': service,
          'professionalId': pro,
          'date': slots[slot],
        },
      );
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Novo agendamento')),
    body: ListView(
      padding: const EdgeInsets.all(20),
      children: [
        if (error != null) Notice(error!),
        selection(
          'Cliente',
          widget.clients,
          client,
          (value) => setState(() => client = value),
        ),
        selection(
          'Serviço',
          objects(
            widget.salon['services'],
          ).where((r) => r['status'] == 'active').toList(),
          service,
          (value) {
            service = value;
            loadSlots();
          },
        ),
        selection(
          'Profissional',
          objects(
            widget.salon['professionals'],
          ).where((r) => r['status'] == 'active').toList(),
          pro,
          (value) {
            pro = value;
            loadSlots();
          },
        ),
        OutlinedButton(
          onPressed: () async {
            final result = await showDatePicker(
              context: context,
              firstDate: DateTime.now(),
              lastDate: DateTime.now().add(const Duration(days: 365)),
            );
            if (result != null) {
              date = result;
              loadSlots();
            }
          },
          child: Text(date == null ? 'Escolher data' : dateString(date!)),
        ),
        Text('Fuso do salão: ${widget.salon['timezone']}'),
        Wrap(
          spacing: 8,
          children: slots.keys
              .map(
                (label) => ChoiceChip(
                  label: Text(label),
                  selected: slot == label,
                  onSelected: (_) => setState(() => slot = label),
                ),
              )
              .toList(),
        ),
        if (date != null && slots.isEmpty)
          const Notice(
            'Selecione serviço e profissional. Somente horários livres serão apresentados.',
          ),
        FilledButton(
          onPressed: busy || client == null || slot == null ? null : save,
          child: Text(busy ? 'Salvando...' : 'Registrar reserva'),
        ),
      ],
    ),
  );
}

String dateString(DateTime date) =>
    '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
Widget selection(
  String label,
  List<Map<String, dynamic>> rows,
  String? value,
  ValueChanged<String?> onChanged,
) => Padding(
  padding: const EdgeInsets.only(bottom: 16),
  child: DropdownButtonFormField<String>(
    initialValue: value,
    isExpanded: true,
    decoration: InputDecoration(labelText: label),
    items: rows
        .map(
          (row) => DropdownMenuItem(
            value: '${row['id']}',
            child: Text('${row['name']}', overflow: TextOverflow.ellipsis),
          ),
        )
        .toList(),
    onChanged: onChanged,
  ),
);

class SubscriptionPage extends StatelessWidget {
  final ApiClient api;
  const SubscriptionPage({super.key, required this.api});
  @override
  Widget build(BuildContext context) => DataPage(
    api: api,
    path: '/salon/details',
    builder: (context, data, reload) {
      final subs = objects(data['subscriptions']);
      final sub = subs.first;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Plano ${sub['plan']?['name'] ?? ''}',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          Notice(
            '${data['trialExpired'] == true ? 'Assinatura suspensa ou vencida' : sub['status']}\n${sub['currentPeriodEnd'] ?? sub['trialEnds'] ?? ''}',
          ),
          const Text(
            'A assinatura é mensal e o pagamento é conferido pelo administrador. Solicitar um plano não ativa o acesso. O pagamento não é automático.',
          ),
          if (sub['pendingPlanId'] != null)
            const Notice('Sua solicitação aguarda conferência.'),
          const SizedBox(height: 20),
          DataPage(
            api: api,
            path: '/public/plans',
            builder: (context, plans, _) => Column(
              children: objects(plans)
                  .map(
                    (plan) => Card(
                      child: ListTile(
                        title: Text(
                          '${plan['name']} • ${money(plan['price'])}/mês',
                        ),
                        subtitle: Text((plan['features'] as List).join('\n')),
                        trailing: IconButton(
                          tooltip: 'Solicitar ${plan['name']}',
                          icon: const Icon(Icons.arrow_forward),
                          onPressed: () async {
                            if (!await confirmAction(
                              context,
                              'Solicitar ${plan['name']} e aguardar conferência do pagamento?',
                            )) {
                              return;
                            }
                            try {
                              await api.request(
                                'POST',
                                '/salon/upgrade-plan',
                                body: {'planId': plan['id']},
                              );
                              await reload();
                            } catch (e) {
                              if (context.mounted) showFailure(context, e);
                            }
                          },
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      );
    },
  );
}

class SettingsPage extends StatelessWidget {
  final ApiClient api;
  const SettingsPage({super.key, required this.api});
  @override
  Widget build(BuildContext context) => DataPage(
    api: api,
    path: '/salon/details',
    builder: (context, data, reload) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          '${data['name']}',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        Notice(
          'CPF/CNPJ: ${data['document'] ?? 'Não informado'}\nChave Pix: ${data['pixKey'] ?? 'Não cadastrada'}',
        ),
        SelectableText('Identificador público: ${data['slug']}'),
        OutlinedButton.icon(
          onPressed: () =>
              Clipboard.setData(ClipboardData(text: '${data['slug']}')),
          icon: const Icon(Icons.copy),
          label: const Text('Copiar identificador do salão'),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: () async {
            final input = await editFields(
              context,
              'Configurações do salão',
              {
                'Nome': '${data['name']}',
                'Chave Pix': '${data['pixKey'] ?? ''}',
              },
              optional: {'Chave Pix'},
            );
            if (input == null) return;
            try {
              await api.request(
                'PUT',
                '/salon/details',
                body: {'name': input['Nome'], 'pixKey': input['Chave Pix']},
              );
              await reload();
            } catch (e) {
              if (context.mounted) showFailure(context, e);
            }
          },
          child: const Text('Editar configurações'),
        ),
        const Notice(
          'Sem chave Pix cadastrada, a reserva é registrada sem cobrança antecipada. O salão confere o recebimento no banco antes de confirmar o atendimento.',
        ),
      ],
    ),
  );
}

class HoursPage extends StatefulWidget {
  final ApiClient api;
  const HoursPage({super.key, required this.api});
  @override
  State<HoursPage> createState() => _HoursPageState();
}

class _HoursPageState extends State<HoursPage> {
  List<Map<String, dynamic>> days = [];
  List<String> blocks = [];
  String timezone = 'America/Sao_Paulo';
  bool loaded = false;
  bool busy = false;
  String? message;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final data = await widget.api.request('GET', '/salon/details');
      if (mounted) {
        setState(() {
          days = objects(jsonDecode(data['scheduleRaw']));
          blocks = List<String>.from(jsonDecode(data['blockedDates']));
          timezone = data['timezone'];
          loaded = true;
        });
      }
    } catch (e) {
      if (mounted) setState(() => message = e.toString());
    }
  }

  Future<void> save() async {
    setState(() => busy = true);
    try {
      await widget.api.request(
        'PUT',
        '/salon/details',
        body: {
          'scheduleRaw': jsonEncode(days),
          'blockedDates': jsonEncode(blocks),
          'timezone': timezone,
        },
      );
      if (mounted) setState(() => message = 'Horários salvos.');
    } catch (e) {
      if (mounted) setState(() => message = e.toString());
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      if (message != null) Notice(message!),
      if (!loaded && message == null)
        const Center(child: CircularProgressIndicator()),
      if (loaded) ...[
        DropdownButtonFormField<String>(
          initialValue: timezone,
          isExpanded: true,
          decoration: const InputDecoration(labelText: 'Fuso do salão'),
          items:
              [
                    'America/Sao_Paulo',
                    'America/Manaus',
                    'America/Rio_Branco',
                    'America/Noronha',
                    'America/Cuiaba',
                    'America/Belem',
                  ]
                  .map(
                    (zone) => DropdownMenuItem(value: zone, child: Text(zone)),
                  )
                  .toList(),
          onChanged: (value) => setState(() => timezone = value!),
        ),
        ...days.map(
          (day) => Card(
            child: Column(
              children: [
                SwitchListTile(
                  title: Text('${day['day']}'),
                  value: day['open'] == true,
                  onChanged: busy
                      ? null
                      : (value) => setState(() => day['open'] = value),
                ),
                if (day['open'] == true)
                  Wrap(
                    spacing: 12,
                    children: ['start', 'end']
                        .map(
                          (field) => TextButton(
                            onPressed: busy
                                ? null
                                : () async {
                                    final pieces = '${day[field]}'.split(':');
                                    final result = await showTimePicker(
                                      context: context,
                                      initialTime: TimeOfDay(
                                        hour: int.tryParse(pieces.first) ?? 9,
                                        minute: pieces.length > 1
                                            ? int.tryParse(pieces[1]) ?? 0
                                            : 0,
                                      ),
                                    );
                                    if (result != null) {
                                      setState(
                                        () => day[field] =
                                            '${result.hour.toString().padLeft(2, '0')}:${result.minute.toString().padLeft(2, '0')}',
                                      );
                                    }
                                  },
                            child: Text(
                              '${field == 'start' ? 'Abertura' : 'Fechamento'}: ${day[field]}',
                            ),
                          ),
                        )
                        .toList(),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Dias bloqueados para todo o salão',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        ...blocks.map(
          (date) => ListTile(
            title: Text(date),
            trailing: IconButton(
              tooltip: 'Remover bloqueio',
              icon: const Icon(Icons.delete_outline),
              onPressed: busy
                  ? null
                  : () => setState(() => blocks.remove(date)),
            ),
          ),
        ),
        OutlinedButton(
          onPressed: busy
              ? null
              : () async {
                  final date = await showDatePicker(
                    context: context,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 730)),
                  );
                  if (date != null) {
                    setState(() {
                      blocks = {...blocks, dateString(date)}.toList()..sort();
                    });
                  }
                },
          child: const Text('Adicionar data bloqueada'),
        ),
        FilledButton(
          onPressed: busy ? null : save,
          child: Text(busy ? 'Salvando...' : 'Salvar horários'),
        ),
      ],
    ],
  );
}
