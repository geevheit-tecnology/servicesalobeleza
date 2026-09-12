import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class AgendaView extends StatefulWidget {
  const AgendaView({super.key});

  @override
  State<AgendaView> createState() => _AgendaViewState();
}

class _AgendaViewState extends State<AgendaView> {
  String _currentFilter = 'Dia';

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Agenda', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              Row(
                children: [
                  Container(
                    decoration: BoxDecoration(border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        _ToggleBtn(label: 'Dia', active: _currentFilter == 'Dia', onTap: () => setState(() => _currentFilter = 'Dia')),
                        _ToggleBtn(label: 'Semana', active: _currentFilter == 'Semana', onTap: () => setState(() => _currentFilter = 'Semana')),
                        _ToggleBtn(label: 'Mês', active: _currentFilter == 'Mês', onTap: () => setState(() => _currentFilter = 'Mês')),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  AppButton(label: 'Novo agendamento', icon: LucideIcons.plus, onPressed: () {}),
                ],
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          Container(
            height: 600,
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                // Header
                Container(
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      const SizedBox(width: 80, height: 60),
                      _ProHeader(name: 'Ana', specialty: 'Cabelos'),
                      _ProHeader(name: 'Mariana', specialty: 'Unhas'),
                      _ProHeader(name: 'Juliana', specialty: 'Massagens'),
                    ],
                  ),
                ),
                // Grid
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      children: [
                        _TimeRow(time: '09:00', slots: [
                          _AgendaBlock(client: 'Fernanda L.', service: 'Escova Prog.', color: Colors.green),
                          null,
                          null,
                        ]),
                        _TimeRow(time: '10:00', slots: [
                          null,
                          _AgendaBlock(client: 'Camila F.', service: 'Manicure', color: Colors.orange),
                          null,
                        ]),
                        _TimeRow(time: '11:00', slots: [
                          null,
                          null,
                          _AgendaBlock(client: 'Patrícia S.', service: 'Massagem', color: Colors.green),
                        ]),
                        _TimeRow(time: '12:00', slots: [null, null, null]),
                        _TimeRow(time: '13:00', slots: [
                          _AgendaBlock(client: 'Beatriz R.', service: 'Corte', color: Colors.green),
                          null,
                          null,
                        ]),
                        _TimeRow(time: '14:00', slots: [
                          null,
                          _AgendaBlock(client: 'Letícia M.', service: 'Pedicure', color: Colors.orange, status: 'Aguardando Pagamento'),
                          null,
                        ]),
                      ],
                    ),
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

class _ToggleBtn extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _ToggleBtn({required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppTheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : AppTheme.mutedForeground,
            fontWeight: active ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}

class _ProHeader extends StatelessWidget {
  final String name;
  final String specialty;

  const _ProHeader({required this.name, required this.specialty});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 60,
        decoration: const BoxDecoration(border: Border(left: BorderSide(color: AppTheme.border))),
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
            Text(specialty, style: const TextStyle(color: AppTheme.mutedForeground, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _TimeRow extends StatelessWidget {
  final String time;
  final List<Widget?> slots;

  const _TimeRow({required this.time, required this.slots});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80,
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
      child: Row(
        children: [
          SizedBox(
            width: 80,
            child: Padding(
              padding: const EdgeInsets.only(top: 8, right: 16),
              child: Text(time, textAlign: TextAlign.right, style: const TextStyle(color: AppTheme.mutedForeground, fontSize: 12)),
            ),
          ),
          ...slots.map((s) => Expanded(
            child: Container(
              height: double.infinity,
              decoration: const BoxDecoration(border: Border(left: BorderSide(color: AppTheme.border))),
              padding: const EdgeInsets.all(4),
              child: s ?? const SizedBox(),
            ),
          )),
        ],
      ),
    );
  }
}

class _AgendaBlock extends StatelessWidget {
  final String client;
  final String service;
  final MaterialColor color;
  final String status;

  const _AgendaBlock({required this.client, required this.service, required this.color, this.status = 'Confirmado'});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        showDialog(
          context: context,
          builder: (c) => AlertDialog(
            title: Text('Detalhes: $client'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Serviço: $service', style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Text('Status: ', style: TextStyle(fontSize: 16)),
                    AppBadge(text: status, variant: status == 'Confirmado' ? AppBadgeVariant.success : AppBadgeVariant.warning),
                  ],
                ),
                const SizedBox(height: 16),
                const Text('Obs: O sistema bloqueia a agenda por 15 minutos até a confirmação do PIX. Se não pago, o horário é liberado automaticamente.', style: TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
              ],
            ),
            actions: [
              if (status == 'Aguardando Pagamento')
                TextButton(onPressed: () {}, child: const Text('Cancelar manualmente', style: TextStyle(color: Colors.red))),
              TextButton(onPressed: () => Navigator.pop(c), child: const Text('Fechar')),
            ],
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: color.shade50,
          border: Border.all(color: color.shade200),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(client, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: color.shade800)),
            Text(service, style: TextStyle(fontSize: 11, color: color.shade600)),
            if (status != 'Confirmado') ...[
              const Spacer(),
              Text('⏳ Pendente', style: TextStyle(fontSize: 10, color: color.shade800, fontWeight: FontWeight.bold)),
            ]
          ],
        ),
      ),
    );
  }
}
