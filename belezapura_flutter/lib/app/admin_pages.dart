import 'package:flutter/material.dart';
import '../core/api_client.dart';
import 'connected_app.dart';

class AdminSubscriptionsPage extends StatefulWidget {
  final ApiClient api;
  const AdminSubscriptionsPage({super.key, required this.api});
  @override
  State<AdminSubscriptionsPage> createState() => _AdminSubscriptionsPageState();
}

class _AdminSubscriptionsPageState extends State<AdminSubscriptionsPage> {
  bool busy = false;
  Future<void> action(
    BuildContext context,
    Map<String, dynamic> sub,
    String status,
    Future<void> Function() reload,
  ) async {
    final body = <String, dynamic>{'status': status};
    if (status == 'ACTIVE') {
      final input = await editFields(
        context,
        'Conferir recebimento',
        {
          'Referência bancária': '',
          'Valor recebido': '${sub['requestedPrice'] ?? ''}',
        },
        numeric: {'Valor recebido'},
      );
      if (input == null) return;
      body.addAll({
        'paymentReference': input['Referência bancária'],
        'amount': num.parse(input['Valor recebido']!.replaceAll(',', '.')),
      });
    } else if (!await confirmAction(
      context,
      'Alterar a assinatura de ${sub['salon']} para $status?',
    )) {
      return;
    }
    if (!mounted) return;
    setState(() => busy = true);
    try {
      await widget.api.request(
        'PUT',
        '/superadmin/subscriptions/${sub['id']}/status',
        body: body,
      );
      await reload();
    } catch (e) {
      if (context.mounted) showFailure(context, e);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => DataPage(
    api: widget.api,
    path: '/superadmin/subscriptions',
    builder: (context, data, reload) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Notice(
          'Confira o crédito na conta da plataforma antes de aprovar. Uma referência bancária só pode ser usada uma vez. A aprovação libera um mês de acesso.',
        ),
        ...objects(data).map(
          (sub) => Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${sub['salon']}',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  Text('${sub['plan']} • ${sub['status']}'),
                  Text('Vencimento: ${sub['next']}'),
                  if (sub['pendingPlanId'] != null)
                    Text(
                      'Solicitado: ${sub['pendingPlanName']} • ${money(sub['requestedPrice'])}',
                    ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: [
                      if (sub['pendingPlanId'] != null)
                        FilledButton(
                          onPressed: busy
                              ? null
                              : () => action(context, sub, 'ACTIVE', reload),
                          child: const Text('Conferir pagamento'),
                        ),
                      OutlinedButton(
                        onPressed: busy
                            ? null
                            : () => action(context, sub, 'BLOCKED', reload),
                        child: const Text('Bloquear'),
                      ),
                      TextButton(
                        onPressed: busy
                            ? null
                            : () => action(context, sub, 'CANCELED', reload),
                        child: const Text('Cancelar'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    ),
  );
}
