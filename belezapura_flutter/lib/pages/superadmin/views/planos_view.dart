import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class PlanosView extends StatelessWidget {
  const PlanosView({super.key});

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
              const Text('Gestão de Planos', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Criar Plano', icon: LucideIcons.plus, onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          
          Row(
            children: [
              _PlanCard(name: 'Básico', price: 'Grátis', features: ['Até 50 clientes', 'Agenda simples', 'Sem pagamentos online'], active: 1420),
              const SizedBox(width: 24),
              _PlanCard(name: 'Pro', price: 'R\$ 149/mês', features: ['Clientes ilimitados', 'Pagamentos via PIX', 'Gestão financeira'], active: 450, featured: true),
              const SizedBox(width: 24),
              _PlanCard(name: 'Premium', price: 'R\$ 299/mês', features: ['Múltiplas filiais', 'Suporte prioritário', 'Relatórios avançados'], active: 89),
            ],
          ),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String name;
  final String price;
  final List<String> features;
  final int active;
  final bool featured;

  const _PlanCard({required this.name, required this.price, required this.features, required this.active, this.featured = false});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: featured ? AppTheme.primary : AppTheme.card,
          border: Border.all(color: featured ? AppTheme.primary : AppTheme.border),
          borderRadius: BorderRadius.circular(24),
          boxShadow: featured ? [BoxShadow(color: AppTheme.primary.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 10))] : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18, color: featured ? Colors.white : AppTheme.foreground)),
            const SizedBox(height: 12),
            Text(price, style: TextStyle(fontFamily: 'Fraunces', fontSize: 36, fontWeight: FontWeight.w500, color: featured ? Colors.white : AppTheme.foreground)),
            const SizedBox(height: 24),
            ...features.map((f) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                children: [
                  Icon(LucideIcons.check, size: 16, color: featured ? Colors.white : AppTheme.primary),
                  const SizedBox(width: 8),
                  Text(f, style: TextStyle(color: featured ? Colors.white.withValues(alpha: 0.9) : AppTheme.mutedForeground)),
                ],
              ),
            )),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: featured ? Colors.white.withValues(alpha: 0.1) : AppTheme.secondary, borderRadius: BorderRadius.circular(12)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Assinantes ativos', style: TextStyle(fontSize: 12, color: featured ? Colors.white.withValues(alpha: 0.9) : AppTheme.mutedForeground)),
                  Text(active.toString(), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: featured ? Colors.white : AppTheme.foreground)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
