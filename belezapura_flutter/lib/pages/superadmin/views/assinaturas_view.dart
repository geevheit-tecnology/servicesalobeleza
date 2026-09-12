import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class AssinaturasView extends StatelessWidget {
  const AssinaturasView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Assinaturas', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
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
                      Expanded(flex: 2, child: Text('Salão', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Plano Atual', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Faturamento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Próx. Cobrança', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Status', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      SizedBox(width: 32),
                    ],
                  ),
                ),
                ...[
                  {'n': 'Salão Rosé', 'p': 'Pro', 'f': 'R\$ 149,00', 'd': '05/11/2024', 'st': 'Ativo'},
                  {'n': 'Barbearia Vintage', 'p': 'Premium', 'f': 'R\$ 299,00', 'd': '01/10/2024', 'st': 'Atrasado'},
                  {'n': 'Studio Beauty', 'p': 'Trial', 'f': 'R\$ 0,00', 'd': '12/10/2024', 'st': 'Em Teste'},
                ].map((s) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Text(s['n'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))),
                      Expanded(flex: 1, child: Text(s['p'] as String, style: const TextStyle(fontSize: 14))),
                      Expanded(flex: 1, child: Text(s['f'] as String, style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary, fontSize: 14))),
                      Expanded(flex: 1, child: Text(s['d'] as String, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: AppBadge(text: s['st'] as String, variant: s['st'] == 'Ativo' ? AppBadgeVariant.success : (s['st'] == 'Atrasado' ? AppBadgeVariant.danger : AppBadgeVariant.warning))),
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
                                title: const Text('Gerenciar Assinatura'),
                                content: const Text('Formulário de gestão do plano do salão (Aguardando integração).'),
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
