import 'package:flutter/material.dart';

import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class AvaliacoesView extends StatelessWidget {
  const AvaliacoesView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Avaliações', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
          const SizedBox(height: 24),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 1,
                child: Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    children: [
                      const Text('4,9', style: TextStyle(fontFamily: 'Fraunces', fontSize: 64, color: Colors.orange, height: 1)),
                      const SizedBox(height: 8),
                      Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(5, (index) => const Icon(Icons.star, color: Colors.orange, size: 24))),
                      const SizedBox(height: 12),
                      const Text('327 avaliações', style: TextStyle(color: AppTheme.mutedForeground)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: 2,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Distribuição', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                      const SizedBox(height: 24),
                      ...[
                        [5, 78], [4, 15], [3, 5], [2, 1], [1, 1]
                      ].map((star) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Row(
                          children: [
                            SizedBox(width: 20, child: Text(star[0].toString(), style: const TextStyle(color: AppTheme.mutedForeground))),
                            const Icon(Icons.star, color: Colors.orange, size: 14),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Container(
                                height: 8,
                                decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(4)),
                                child: FractionallySizedBox(
                                  alignment: Alignment.centerLeft,
                                  widthFactor: star[1] / 100,
                                  child: Container(decoration: BoxDecoration(color: Colors.orange, borderRadius: BorderRadius.circular(4))),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            SizedBox(width: 40, child: Text('${star[1]}%', textAlign: TextAlign.right, style: const TextStyle(color: AppTheme.mutedForeground))),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          ...[
            {'n': 'Fernanda Lima', 'r': 5, 'c': 'Atendimento incrível! Ana foi muito cuidadosa com meu cabelo.', 'd': 'Há 2 dias', 'rep': false},
            {'n': 'Camila P.', 'r': 5, 'c': 'Melhor manicure da cidade! Já indiquei para todas as amigas.', 'd': 'Há 4 dias', 'rep': true},
            {'n': 'Sandra T.', 'r': 4, 'c': 'Ótimo serviço, só achei que poderia ter mais horários disponíveis.', 'd': 'Há 1 semana', 'rep': false},
          ].map((r) => Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        AppAvatar(name: r['n'] as String, radius: 16),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(r['n'] as String, style: const TextStyle(fontWeight: FontWeight.w500)),
                            Row(children: List.generate(r['r'] as int, (index) => const Icon(Icons.star, color: Colors.orange, size: 12))),
                          ],
                        ),
                      ],
                    ),
                    Text(r['d'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                  ],
                ),
                const SizedBox(height: 16),
                Text(r['c'] as String, style: const TextStyle(color: AppTheme.mutedForeground)),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (r['rep'] as bool)
                      const AppBadge(text: 'Respondido', variant: AppBadgeVariant.success)
                    else
                      const AppBadge(text: 'Sem resposta', variant: AppBadgeVariant.outline),
                    AppButton(label: 'Responder', variant: AppButtonVariant.ghost, size: AppButtonSize.sm, onPressed: () {}),
                  ],
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
