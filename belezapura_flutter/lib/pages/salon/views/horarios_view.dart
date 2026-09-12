import 'package:flutter/material.dart';

import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class HorariosView extends StatelessWidget {
  const HorariosView({super.key});

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
              const Text('Horários de funcionamento', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Salvar alterações', onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                const Row(
                  children: [
                    Expanded(flex: 2, child: Text('Dia', style: TextStyle(fontWeight: FontWeight.w600))),
                    Expanded(flex: 3, child: Text('Horário', style: TextStyle(fontWeight: FontWeight.w600))),
                  ],
                ),
                const SizedBox(height: 16),
                const Divider(),
                const SizedBox(height: 16),
                ...[
                  {'d': 'Segunda-feira', 'on': true, 't': '09:00 - 18:00'},
                  {'d': 'Terça-feira', 'on': true, 't': '09:00 - 18:00'},
                  {'d': 'Quarta-feira', 'on': true, 't': '09:00 - 18:00'},
                  {'d': 'Quinta-feira', 'on': true, 't': '09:00 - 18:00'},
                  {'d': 'Sexta-feira', 'on': true, 't': '09:00 - 19:00'},
                  {'d': 'Sábado', 'on': true, 't': '08:00 - 17:00'},
                  {'d': 'Domingo', 'on': false, 't': 'Fechado'},
                ].map((h) => Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: Row(
                          children: [
                            Switch(value: h['on'] as bool, onChanged: (v) {}, activeThumbColor: AppTheme.primary),
                            const SizedBox(width: 8),
                            Text(h['d'] as String, style: const TextStyle(fontWeight: FontWeight.w500)),
                          ],
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(h['t'] as String, style: TextStyle(color: (h['on'] as bool) ? AppTheme.foreground : AppTheme.mutedForeground)),
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
