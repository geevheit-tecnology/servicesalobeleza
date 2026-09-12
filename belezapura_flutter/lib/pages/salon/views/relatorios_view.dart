import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class RelatoriosView extends StatelessWidget {
  const RelatoriosView({super.key});

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
              const Text('Relatórios', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(
                label: 'Exportar Relatório',
                icon: LucideIcons.download,
                variant: AppButtonVariant.outline,
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Exportar Dados'),
                      content: const Text('Escolha o formato para exportar (A API irá gerar o arquivo final).'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
                        AppButton(label: 'Gerar PDF', icon: LucideIcons.fileText, onPressed: () => Navigator.pop(ctx)),
                        AppButton(label: 'Gerar Excel', icon: LucideIcons.table, variant: AppButtonVariant.secondary, onPressed: () => Navigator.pop(ctx)),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(8)),
                child: const Row(children: [Icon(LucideIcons.calendar, size: 16, color: AppTheme.mutedForeground), SizedBox(width: 8), Text('Mês atual (Outubro 2024)', style: TextStyle(fontSize: 14)), SizedBox(width: 8), Icon(LucideIcons.chevronDown, size: 16)]),
              ),
              const SizedBox(width: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(8)),
                child: const Row(children: [Icon(LucideIcons.filter, size: 16, color: AppTheme.mutedForeground), SizedBox(width: 8), Text('Filtrar por Profissional', style: TextStyle(fontSize: 14)), SizedBox(width: 8), Icon(LucideIcons.chevronDown, size: 16)]),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Faturamento Líquido', style: TextStyle(color: AppTheme.mutedForeground)),
                      const SizedBox(height: 8),
                      const Text('R\$ 12.450,00', style: TextStyle(fontFamily: 'Fraunces', fontSize: 28, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Row(
                        children: const [
                          Icon(LucideIcons.trendingUp, size: 16, color: Colors.green),
                          SizedBox(width: 4),
                          Text('+15% em relação ao mês anterior', style: TextStyle(color: Colors.green, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total de Atendimentos', style: TextStyle(color: AppTheme.mutedForeground)),
                      const SizedBox(height: 8),
                      const Text('142', style: TextStyle(fontFamily: 'Fraunces', fontSize: 28, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Row(
                        children: const [
                          Icon(LucideIcons.trendingUp, size: 16, color: Colors.green),
                          SizedBox(width: 4),
                          Text('+8% em relação ao mês anterior', style: TextStyle(color: Colors.green, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Ticket Médio', style: TextStyle(color: AppTheme.mutedForeground)),
                      const SizedBox(height: 8),
                      const Text('R\$ 87,60', style: TextStyle(fontFamily: 'Fraunces', fontSize: 28, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Row(
                        children: const [
                          Icon(LucideIcons.minus, size: 16, color: AppTheme.mutedForeground),
                          SizedBox(width: 4),
                          Text('Estável', style: TextStyle(color: AppTheme.mutedForeground, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 32),
          
          const Text('Serviços Mais Realizados', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
          const SizedBox(height: 16),
          Container(
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
                  child: const Row(
                    children: [
                      Expanded(flex: 2, child: Text('Serviço', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Quantidade', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Receita Bruta', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                    ],
                  ),
                ),
                ...[
                  {'s': 'Escova Progressiva', 'q': '45', 'v': 'R\$ 6.750,00'},
                  {'s': 'Manicure e Pedicure', 'q': '68', 'v': 'R\$ 4.080,00'},
                  {'s': 'Corte Feminino', 'q': '29', 'v': 'R\$ 2.320,00'},
                ].map((s) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Text(s['s'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))),
                      Expanded(flex: 1, child: Text(s['q'] as String, style: const TextStyle(fontSize: 14))),
                      Expanded(flex: 1, child: Text(s['v'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))),
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
