import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class AppointmentsView extends StatelessWidget {
  const AppointmentsView({super.key});

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
              const Text('Agendamentos', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Novo', icon: LucideIcons.plus, onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Row(
              children: [
                ...['Data', 'Profissional', 'Serviço', 'Status', 'Pagamento'].map((f) => 
                  Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.filter, size: 14, color: AppTheme.mutedForeground),
                        const SizedBox(width: 6),
                        Text(f, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground)),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(8)),
                  child: const Row(
                    children: [
                      Icon(LucideIcons.search, size: 14, color: AppTheme.mutedForeground),
                      SizedBox(width: 8),
                      Text('Buscar...', style: TextStyle(color: AppTheme.mutedForeground)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          Container(
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
                  child: const Row(
                    children: [
                      Expanded(flex: 2, child: Text('Cliente', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 2, child: Text('Serviço', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Profissional', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Data / Hora', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Valor', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Pagamento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Status', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      SizedBox(width: 32),
                    ],
                  ),
                ),
                // Body
                ...[
                  {'c': 'Fernanda Lima', 's': 'Escova Progressiva', 'p': 'Ana', 'd': 'Hoje', 't': '09:00', 'v': 'R\$ 180', 'pay': 'PIX', 'st': 'Confirmado', 'var': AppBadgeVariant.success},
                  {'c': 'Camila Ferreira', 's': 'Manicure Gel', 'p': 'Mariana', 'd': 'Hoje', 't': '10:00', 'v': 'R\$ 65', 'pay': 'Dinheiro', 'st': 'Aguardando', 'var': AppBadgeVariant.warning},
                  {'c': 'Beatriz Rocha', 's': 'Corte + Hidratação', 'p': 'Ana', 'd': 'Hoje', 't': '11:30', 'v': 'R\$ 130', 'pay': 'Cartão', 'st': 'Confirmado', 'var': AppBadgeVariant.success},
                ].map((a) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Row(children: [AppAvatar(name: a['c'] as String, radius: 12), const SizedBox(width: 8), Text(a['c'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))])),
                      Expanded(flex: 2, child: Text(a['s'] as String, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text(a['p'] as String, style: const TextStyle(fontSize: 14))),
                      Expanded(flex: 1, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(a['d'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)), Text(a['t'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground))])),
                      Expanded(flex: 1, child: Text(a['v'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.primary))),
                      Expanded(flex: 1, child: AppBadge(text: a['pay'] as String, variant: AppBadgeVariant.outline)),
                      Expanded(flex: 1, child: AppBadge(text: a['st'] as String, variant: a['st'] == 'Confirmado' ? AppBadgeVariant.success : AppBadgeVariant.warning)),
                      SizedBox(width: 32, child: PopupMenuButton(
                        icon: const Icon(LucideIcons.moreHorizontal, size: 16, color: AppTheme.mutedForeground),
                        padding: EdgeInsets.zero,
                        itemBuilder: (context) => [
                          const PopupMenuItem(value: 'edit', child: Text('Editar')),
                          const PopupMenuItem(value: 'cancel', child: Text('Cancelar', style: TextStyle(color: Colors.red))),
                        ],
                        onSelected: (val) {
                          if (val == 'edit') {
                            showDialog(
                              context: context,
                              builder: (c) => AlertDialog(
                                title: const Text('Editar Agendamento'),
                                content: const Text('Módulo de alteração de horário (Aguardando integração).'),
                                actions: [TextButton(onPressed: () => Navigator.pop(c), child: const Text('Fechar'))],
                              ),
                            );
                          }
                        },
                      )),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
