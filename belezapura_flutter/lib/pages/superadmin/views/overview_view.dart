import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class OverviewView extends StatelessWidget {
  const OverviewView({super.key});

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
                  Text('Visão geral da plataforma', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
                  Text('Outubro 2024', style: TextStyle(color: AppTheme.mutedForeground)),
                ],
              ),
              const AppBadge(text: '✓ Plataforma operacional', variant: AppBadgeVariant.success),
            ],
          ),
          const SizedBox(height: 32),
          
          Row(
            children: [
              Expanded(child: _StatCard(title: 'Salões ativos', value: '2.418', sub: '+94 este mês', icon: LucideIcons.store, trend: 21, color: Colors.blue)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'MRR', value: 'R\$ 49,2K', sub: 'Receita recorrente', icon: LucideIcons.trendingUp, trend: 9, color: Colors.green)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Assinaturas ativas', value: '2.241', sub: '92,7% da base', icon: LucideIcons.creditCard, trend: 8, color: Colors.purple)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Inadimplentes', value: '87', sub: '3,6% da base', icon: LucideIcons.alertCircle, trend: -2, color: Colors.red)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _StatCard(title: 'Agendamentos/mês', value: '182.400', icon: LucideIcons.sparkles, trend: 14, color: Colors.lightBlue)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Clientes', value: '94.200', icon: LucideIcons.users, trend: 18, color: Colors.orange)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Novos salões', value: '94', sub: 'este mês', icon: LucideIcons.plus, trend: 15, color: Colors.blue)),
              const SizedBox(width: 16),
              Expanded(child: _StatCard(title: 'Tickets abertos', value: '12', sub: '2 urgentes', icon: LucideIcons.headphones, trend: -5, color: Colors.red)),
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
          if (sub != null) Text(sub!, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
        ],
      ),
    );
  }
}
