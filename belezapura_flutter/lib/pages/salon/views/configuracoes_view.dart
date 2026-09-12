import 'package:flutter/material.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class ConfiguracoesView extends StatelessWidget {
  const ConfiguracoesView({super.key});

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
              const Text('Configurações', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
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
                const Text('Dados gerais', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: _FormGroup(label: 'Nome do Salão', value: 'Salão Rosé')),
                    const SizedBox(width: 16),
                    Expanded(child: _FormGroup(label: 'CNPJ', value: '12.345.678/0001-90')),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _FormGroup(label: 'E-mail', value: 'contato@salaorose.com')),
                    const SizedBox(width: 16),
                    Expanded(child: _FormGroup(label: 'Telefone', value: '(11) 99999-0000')),
                  ],
                ),
                const SizedBox(height: 32),
                const Divider(),
                const SizedBox(height: 32),
                const Text('Integrações de Pagamento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: _FormGroup(label: 'Chave PIX', value: 'contato@salaorose.com')),
                    const SizedBox(width: 16),
                    const Expanded(child: SizedBox()),
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
