import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class SaloesView extends StatelessWidget {
  const SaloesView({super.key});

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
              const Text('Salões Registrados', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Novo Salão', icon: LucideIcons.plus, onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: const Row(
              children: [
                Icon(LucideIcons.search, size: 16, color: AppTheme.mutedForeground),
                SizedBox(width: 12),
                Text('Buscar por nome, CNPJ ou email...', style: TextStyle(color: AppTheme.mutedForeground)),
              ],
            ),
          ),
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
                      Expanded(flex: 2, child: Text('Salão', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 2, child: Text('Plano', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Cadastro', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Status', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      SizedBox(width: 60),
                    ],
                  ),
                ),
                ...[
                  {'n': 'Salão Rosé', 'p': 'Plano Pro (R\$ 149/mês)', 'c': 'Há 2 dias', 'st': 'Ativo'},
                  {'n': 'Studio Beauty', 'p': 'Plano Básico (Grátis)', 'c': 'Há 1 semana', 'st': 'Ativo'},
                  {'n': 'Barbearia Vintage', 'p': 'Plano Premium (R\$ 299/mês)', 'c': 'Há 1 mês', 'st': 'Inadimplente'},
                ].map((s) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Row(children: [AppAvatar(name: s['n'] as String, radius: 12), const SizedBox(width: 8), Text(s['n'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))])),
                      Expanded(flex: 2, child: Text(s['p'] as String, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text(s['c'] as String, style: const TextStyle(fontSize: 14))),
                      Expanded(flex: 1, child: AppBadge(text: s['st'] as String, variant: s['st'] == 'Ativo' ? AppBadgeVariant.success : AppBadgeVariant.danger)),
                      SizedBox(
                        width: 60,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(icon: const Icon(LucideIcons.edit3, size: 16), padding: EdgeInsets.zero, constraints: const BoxConstraints(), onPressed: () {}),
                            const SizedBox(width: 8),
                            IconButton(icon: const Icon(LucideIcons.trash2, size: 16), padding: EdgeInsets.zero, constraints: const BoxConstraints(), onPressed: () {}),
                          ],
                        ),
                      ),
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
