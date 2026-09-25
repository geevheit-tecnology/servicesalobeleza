import 'package:flutter/material.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ConfiguracoesAdminView extends StatefulWidget {
  const ConfiguracoesAdminView({super.key});

  @override
  State<ConfiguracoesAdminView> createState() => _ConfiguracoesAdminViewState();
}

class _ConfiguracoesAdminViewState extends State<ConfiguracoesAdminView> {
  final TextEditingController _platformName = TextEditingController();
  final TextEditingController _domain = TextEditingController();
  final TextEditingController _supportEmail = TextEditingController();
  final TextEditingController _trialDays = TextEditingController();
  final TextEditingController _defaultPlanId = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchSettings();
  }

  Future<void> _fetchSettings() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(Uri.parse('http://localhost:3050/api/superadmin/settings'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        _platformName.text = data['platformName'] ?? '';
        _domain.text = data['domain'] ?? '';
        _supportEmail.text = data['supportEmail'] ?? '';
        _trialDays.text = data['trialDays']?.toString() ?? '14';
        _defaultPlanId.text = data['defaultPlanId'] ?? '';
      }
    } catch (e) {
      debugPrint('Error fetching settings: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.put(
        Uri.parse('http://localhost:3050/api/superadmin/settings'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'platformName': _platformName.text,
          'domain': _domain.text,
          'supportEmail': _supportEmail.text,
          'trialDays': int.tryParse(_trialDays.text) ?? 14,
          'defaultPlanId': _defaultPlanId.text,
        }),
      );
      if (res.statusCode == 200) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Configurações salvas com sucesso!'), backgroundColor: AppTheme.primary),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Erro ao salvar.'), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.primary));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Configurações da Plataforma', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Salvar alterações', onPressed: _saveSettings),
            ],
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Dados da plataforma', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: _FormGroup(label: 'Nome', controller: _platformName)),
                    const SizedBox(width: 16),
                    Expanded(child: _FormGroup(label: 'Domínio', controller: _domain)),
                    const SizedBox(width: 16),
                    Expanded(child: _FormGroup(label: 'E-mail suporte', controller: _supportEmail)),
                  ],
                ),
                const SizedBox(height: 32),
                const Divider(),
                const SizedBox(height: 32),
                const Text('Trial e planos', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 18)),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(child: _FormGroup(label: 'Duração do trial (dias)', controller: _trialDays)),
                    const SizedBox(width: 16),
                    Expanded(child: _FormGroup(label: 'ID do Plano padrão', controller: _defaultPlanId)),
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
  final TextEditingController controller;
  
  const _FormGroup({required this.label, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16),
          ),
        ),
      ],
    );
  }
}
