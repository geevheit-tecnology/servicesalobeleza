import 'package:flutter/material.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';

class PagamentosView extends StatelessWidget {
  const PagamentosView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Pagamentos/Faturamento', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
          const SizedBox(height: 24),
          Container(
            height: 300,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: const Text('Gateway de pagamentos em desenvolvimento...', style: TextStyle(color: AppTheme.mutedForeground)),
          ),
        ],
      ),
    );
  }
}
