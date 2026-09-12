import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class UsuariosView extends StatelessWidget {
  const UsuariosView({super.key});

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
              const Text('Usuários (Time Interno)', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Convidar membro', icon: LucideIcons.plus, onPressed: () {}),
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
                      Expanded(flex: 2, child: Text('Nome', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 2, child: Text('E-mail', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Função', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Status', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      SizedBox(width: 60),
                    ],
                  ),
                ),
                ...[
                  {'n': 'Admin Master', 'e': 'admin@beautyos.com', 'r': 'Super Admin', 'st': 'Ativo'},
                  {'n': 'Suporte N1', 'e': 'suporte@beautyos.com', 'r': 'Atendimento', 'st': 'Ativo'},
                ].map((u) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Row(children: [AppAvatar(name: u['n'] as String, radius: 12), const SizedBox(width: 8), Text(u['n'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))])),
                      Expanded(flex: 2, child: Text(u['e'] as String, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: AppBadge(text: u['r'] as String, variant: AppBadgeVariant.info)),
                      Expanded(flex: 1, child: AppBadge(text: u['st'] as String, variant: AppBadgeVariant.success)),
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
