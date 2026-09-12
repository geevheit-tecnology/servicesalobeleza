import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class ComissoesView extends StatelessWidget {
  const ComissoesView({super.key});

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
              const Text('Comissões', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(8)),
                child: const Row(children: [Text('Outubro 2024', style: TextStyle(fontSize: 14)), SizedBox(width: 8), Icon(LucideIcons.chevronDown, size: 16)]),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          Container(
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
                  child: const Row(
                    children: [
                      Expanded(flex: 2, child: Text('Profissional', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Serviços realizados', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Faturamento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Percentual', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Comissão', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('A pagar', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                    ],
                  ),
                ),
                ...[
                  {'p': 'Ana Carvalho', 'sp': 'Cabelos', 'srv': '18', 'rev': 'R\$ 2.840', 'pct': '40%', 'com': 'R\$ 1.136'},
                  {'p': 'Mariana Souza', 'sp': 'Unhas', 'srv': '22', 'rev': 'R\$ 1.430', 'pct': '45%', 'com': 'R\$ 643'},
                  {'p': 'Juliana Costa', 'sp': 'Massagens', 'srv': '12', 'rev': 'R\$ 1.560', 'pct': '50%', 'com': 'R\$ 780'},
                ].map((c) => InkWell(
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: Text('Fechamento: ${c['p']}'),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Serviços no período: ${c['srv']}'),
                            Text('Faturamento gerado: ${c['rev']}'),
                            Text('Comissão (${c['pct']}): ${c['com']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 16),
                            const Text('No sistema final, você poderá baixar o relatório detalhado e marcar como "Pago".', style: TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                          ],
                        ),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
                          AppButton(label: 'Marcar como Pago', onPressed: () => Navigator.pop(ctx)),
                        ],
                      ),
                    );
                  },
                  child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Row(children: [AppAvatar(name: c['p'] as String, radius: 12), const SizedBox(width: 8), Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(c['p'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)), Text(c['sp'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground))])])),
                      Expanded(flex: 1, child: Text('${c['srv']} atend.', style: const TextStyle(fontSize: 14))),
                      Expanded(flex: 1, child: Text(c['rev'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))),
                      Expanded(flex: 1, child: AppBadge(text: c['pct'] as String, variant: AppBadgeVariant.info)),
                      Expanded(flex: 1, child: Text(c['com'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.primary))),
                      Expanded(flex: 1, child: AppBadge(text: c['com'] as String, variant: AppBadgeVariant.warning)),
                    ],
                  ),
                ))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: const BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.vertical(bottom: Radius.circular(16))),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total a pagar este mês', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                      Text('R\$ 2.559', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.primary)),
                    ],
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
