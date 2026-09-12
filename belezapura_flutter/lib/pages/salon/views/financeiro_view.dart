import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';

class FinanceiroView extends StatelessWidget {
  const FinanceiroView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Financeiro', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
          const SizedBox(height: 24),
          
          Row(
            children: [
              Expanded(child: _StatCard(title: 'Receitas do mês', value: 'R\$ 13.280', icon: LucideIcons.trendingUp, trend: 12, color: Colors.green)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Despesas', value: 'R\$ 4.200', icon: LucideIcons.trendingDown, trend: -3, color: Colors.red)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Saldo', value: 'R\$ 9.080', icon: LucideIcons.dollarSign, trend: 18, color: Colors.blue)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'A receber', value: 'R\$ 1.440', sub: '8 pagamentos', icon: LucideIcons.zap, trend: 0, color: Colors.orange)),
            ],
          ),
          const SizedBox(height: 24),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Movimentações recentes', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(8)),
                            child: const Row(children: [Icon(LucideIcons.plus, size: 14), SizedBox(width: 6), Text('Nova', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500))]),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      ...[
                        {'d': 'Escova Progressiva — Fernanda L.', 't': 'in', 'v': 'R\$ 180', 'dt': 'Hoje 09:00', 'm': 'PIX'},
                        {'d': 'Manicure Gel — Camila F.', 't': 'in', 'v': 'R\$ 65', 'dt': 'Hoje 10:00', 'm': 'Dinheiro'},
                        {'d': 'Material de limpeza', 't': 'out', 'v': 'R\$ 120', 'dt': 'Ontem', 'm': 'PIX'},
                      ].map((m) => Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(12)),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 32, height: 32,
                                  decoration: BoxDecoration(color: m['t'] == 'in' ? Colors.green.shade50 : Colors.red.shade50, shape: BoxShape.circle),
                                  child: Icon(m['t'] == 'in' ? LucideIcons.arrowUp : LucideIcons.arrowDown, size: 16, color: m['t'] == 'in' ? Colors.green : Colors.red),
                                ),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(m['d'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                                    Text('${m['dt']} · ${m['m']}', style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                                  ],
                                ),
                              ],
                            ),
                            Text((m['t'] == 'in' ? '+' : '-') + (m['v'] as String), style: TextStyle(fontWeight: FontWeight.w600, color: m['t'] == 'in' ? Colors.green : Colors.red)),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: 1,
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Formas de pagamento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                          const SizedBox(height: 24),
                          ...[
                            ['PIX', '62%', Colors.orange],
                            ['Cartão', '21%', Colors.purple],
                            ['Dinheiro', '12%', Colors.blue],
                          ].map((p) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              children: [
                                SizedBox(width: 60, child: Text(p[0] as String, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground))),
                                Expanded(
                                  child: Container(
                                    height: 8,
                                    decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(4)),
                                    child: FractionallySizedBox(
                                      alignment: Alignment.centerLeft,
                                      widthFactor: int.parse((p[1] as String).replaceAll('%', '')) / 100,
                                      child: Container(decoration: BoxDecoration(color: p[2] as Color, borderRadius: BorderRadius.circular(4))),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                SizedBox(width: 40, child: Text(p[1] as String, textAlign: TextAlign.right, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500))),
                              ],
                            ),
                          )),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final String? sub;
  final IconData icon;
  final double trend;
  final Color color;

  const _StatCard({required this.title, required this.value, this.sub, required this.icon, required this.trend, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: color, size: 20),
              ),
              if (trend != 0) Row(
                children: [
                  Icon(trend >= 0 ? LucideIcons.arrowUpRight : LucideIcons.arrowDownRight, size: 14, color: trend >= 0 ? Colors.green : Colors.red),
                  const SizedBox(width: 4),
                  Text('${trend.abs()}%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: trend >= 0 ? Colors.green : Colors.red)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(value, style: const TextStyle(fontFamily: 'Fraunces', fontSize: 24, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
          if (sub != null) Text(sub!, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
        ],
      ),
    );
  }
}
