import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class ProfissionaisView extends StatelessWidget {
  const ProfissionaisView({super.key});

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
              const Text('Profissionais', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Novo profissional', icon: LucideIcons.plus, onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Cadastrar Profissional'),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        AppInput(label: 'Nome', hintText: 'Nome do profissional'),
                        SizedBox(height: 16),
                        AppInput(label: 'Especialidade', hintText: 'Ex: Cabelos, Unhas'),
                        SizedBox(height: 16),
                        AppInput(label: 'Comissão Padrão (%)', hintText: 'Ex: 40'),
                      ],
                    ),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
                      AppButton(label: 'Salvar', onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                );
              }),
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
                      Expanded(flex: 1, child: Text('Especialidade', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Serviços', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Comissão', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Status', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      SizedBox(width: 60),
                    ],
                  ),
                ),
                ...[
                  {'p': 'Ana Carvalho', 'sp': 'Cabelos', 'srv': '8', 'com': '40%', 'st': 'Ativo'},
                  {'p': 'Mariana Souza', 'sp': 'Unhas', 'srv': '4', 'com': '45%', 'st': 'Ativo'},
                  {'p': 'Juliana Costa', 'sp': 'Massagens', 'srv': '3', 'com': '50%', 'st': 'Ativo'},
                ].map((p) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Row(children: [AppAvatar(name: p['p'] as String, radius: 12), const SizedBox(width: 8), Text(p['p'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))])),
                      Expanded(flex: 1, child: Text(p['sp'] as String, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text(p['srv'] as String, style: const TextStyle(fontSize: 14))),
                      Expanded(flex: 1, child: Text(p['com'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
                      Expanded(flex: 1, child: AppBadge(text: p['st'] as String, variant: AppBadgeVariant.success)),
                      SizedBox(
                        width: 60,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(
                              icon: const Icon(LucideIcons.edit3, size: 16),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (ctx) => AlertDialog(
                                    title: Text('Editar: ${p['p']}'),
                                    content: const Text('Aqui você poderá alterar os dados, serviços vinculados e a regra de comissão deste profissional (API).'),
                                    actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fechar'))],
                                  ),
                                );
                              },
                            ),
                            const SizedBox(width: 8),
                            IconButton(icon: const Icon(LucideIcons.trash2, size: 16, color: Colors.red), padding: EdgeInsets.zero, constraints: const BoxConstraints(), onPressed: () {}),
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
