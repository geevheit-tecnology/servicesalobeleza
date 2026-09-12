import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

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
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Bom dia, Rosé ✨', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
                  Text('Terça-feira, 15 de outubro de 2024', style: TextStyle(color: AppTheme.mutedForeground)),
                ],
              ),
              AppButton(label: 'Novo agendamento', icon: LucideIcons.plus, onPressed: () {}),
            ],
          ),
          const SizedBox(height: 32),
          
          // Stats Row
          Row(
            children: [
              Expanded(child: _StatCard(title: 'Agendamentos', value: '12', sub: '4 restantes', icon: LucideIcons.calendar, trend: 8, color: Colors.blue)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Faturamento', value: 'R\$ 1.280', sub: 'meta: R\$ 1.500', icon: LucideIcons.dollarSign, trend: 12, color: Colors.green)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Ocupação', value: '78%', sub: 'das 3 profissionais', icon: LucideIcons.barChart3, trend: 5, color: Colors.purple)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Novos clientes', value: '5', sub: 'este mês: 18', icon: LucideIcons.users, trend: 15, color: Colors.orange)),
            ],
          ),
          const SizedBox(height: 32),
          
          // Charts Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: Container(
                  height: 300,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Faturamento mensal', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                      const SizedBox(height: 24),
                      Expanded(
                        child: LineChart(
                          LineChartData(
                            gridData: const FlGridData(show: false),
                            titlesData: const FlTitlesData(
                              leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(showTitles: true, reservedSize: 22, interval: 1),
                              ),
                            ),
                            borderData: FlBorderData(show: false),
                            lineBarsData: [
                              LineChartBarData(
                                spots: const [
                                  FlSpot(0, 8200), FlSpot(1, 9400), FlSpot(2, 7800), FlSpot(3, 11200), FlSpot(4, 10400), FlSpot(5, 13800),
                                ],
                                isCurved: true,
                                color: AppTheme.primary,
                                barWidth: 3,
                                isStrokeCapRound: true,
                                dotData: const FlDotData(show: false),
                                belowBarData: BarAreaData(show: true, color: AppTheme.primary.withValues(alpha: 0.2)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: 1,
                child: Container(
                  height: 300,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Serviços por categoria', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                      const SizedBox(height: 24),
                      Expanded(
                        child: PieChart(
                          PieChartData(
                            sectionsSpace: 0,
                            centerSpaceRadius: 40,
                            sections: [
                              PieChartSectionData(color: const Color(0xFFB8614A), value: 40, title: '40%', radius: 50, titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                              PieChartSectionData(color: const Color(0xFF9B7EA8), value: 25, title: '25%', radius: 50, titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                              PieChartSectionData(color: const Color(0xFF5B8DB8), value: 20, title: '20%', radius: 50, titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                              PieChartSectionData(color: const Color(0xFF7DC198), value: 15, title: '15%', radius: 50, titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
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
  final String sub;
  final IconData icon;
  final double trend;
  final Color color;

  const _StatCard({required this.title, required this.value, required this.sub, required this.icon, required this.trend, required this.color});

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
              Row(
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
          Text(sub, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
        ],
      ),
    );
  }
}
