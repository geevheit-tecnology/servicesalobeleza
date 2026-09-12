import 'package:flutter/material.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class ConfiguracoesAdminView extends StatelessWidget {
  const ConfiguracoesAdminView({super.key});

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
              const Text('Configurações Globais', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Salvar alterações', onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Integrações SaaS', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                const SizedBox(height: 24),
                const Row(
                  children: [
                    Expanded(child: _FormGroup(label: 'Stripe API Key', value: 'sk_live_XXXXXXXXXXXXXXXX')),
                    SizedBox(width: 16),
                    Expanded(child: _FormGroup(label: 'SendGrid API Key', value: 'SG.XXXXXXXXXXXXXXXX')),
                  ],
                ),
                const SizedBox(height: 32),
                const Divider(),
                const SizedBox(height: 32),
                const Text('Manutenção', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Switch(value: false, onChanged: (v) {}, activeThumbColor: AppTheme.primary),
                    const SizedBox(width: 8),
                    const Text('Ativar Modo de Manutenção (Bloqueia novos cadastros)'),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FormGroup extends StatelessWidget {
  final String label;
  final String value;
  
  const _FormGroup({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
        const SizedBox(height: 8),
        TextField(
          controller: TextEditingController(text: value),
          decoration: InputDecoration(
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16),
          ),
        ),
      ],
    );
  }
}
