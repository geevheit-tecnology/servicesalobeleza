import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AppointmentsView extends StatefulWidget {
  const AppointmentsView({super.key});

  @override
  State<AppointmentsView> createState() => _AppointmentsViewState();
}

class _AppointmentsViewState extends State<AppointmentsView> {
  List<dynamic> appointments = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      
      final res = await http.get(
        Uri.parse('http://localhost:3050/api/appointments'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (res.statusCode == 200) {
        setState(() {
          appointments = jsonDecode(res.body);
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading appointments: $e');
      setState(() => isLoading = false);
    }
  }

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
              const Text('Agendamentos', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Novo', icon: LucideIcons.plus, onPressed: () {}),
            ],
          ),
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Row(
              children: [
                ...['Data', 'Profissional', 'Serviço', 'Status', 'Pagamento'].map((f) => 
                  Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.filter, size: 14, color: AppTheme.mutedForeground),
                        const SizedBox(width: 6),
                        Text(f, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground)),
                      ],
                    ),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(8)),
                  child: const Row(
                    children: [
                      Icon(LucideIcons.search, size: 14, color: AppTheme.mutedForeground),
                      SizedBox(width: 8),
                      Text('Buscar...', style: TextStyle(color: AppTheme.mutedForeground)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          Container(
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
                  child: const Row(
                    children: [
                      Expanded(flex: 2, child: Text('Cliente', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 2, child: Text('Serviço', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Profissional', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Data / Hora', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Valor', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Pagamento', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Status', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      SizedBox(width: 32),
                    ],
                  ),
                ),
                // Body
                if (isLoading)
                  const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator()))
                else if (appointments.isEmpty)
                  const Padding(padding: EdgeInsets.all(32), child: Center(child: Text('Nenhum agendamento encontrado.')))
                else
                  ...appointments.map((a) {
                    final clientName = a['client'] != null ? a['client']['name'] : 'Desconhecido';
                    final serviceName = a['service'] != null ? a['service']['name'] : 'Serviço';
                    final proName = a['professional'] != null ? a['professional']['name'] : 'Profissional';
                    final date = DateTime.tryParse(a['date'].toString())?.toLocal();
                    final formattedDate = date != null ? '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}' : 'Data';
                    final formattedTime = date != null ? '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}' : 'Hora';
                    final value = a['value'] != null ? 'R\$ ${a['value']}' : 'R\$ 0';
                    final status = a['status'] == 'PENDING_PAYMENT' ? 'Aguardando' : (a['status'] == 'CONFIRMED' ? 'Confirmado' : 'Outro');
                    
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppTheme.border))),
                      child: Row(
                        children: [
                          Expanded(flex: 2, child: Row(children: [AppAvatar(name: clientName, radius: 12), const SizedBox(width: 8), Text(clientName, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))])),
                          Expanded(flex: 2, child: Text(serviceName, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                          Expanded(flex: 1, child: Text(proName, style: const TextStyle(fontSize: 14))),
                          Expanded(flex: 1, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(formattedDate, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)), Text(formattedTime, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground))])),
                          Expanded(flex: 1, child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.primary))),
                          Expanded(flex: 1, child: AppBadge(text: a['paymentMethod'] ?? 'PIX', variant: AppBadgeVariant.outline)),
                          Expanded(flex: 1, child: AppBadge(text: status, variant: status == 'Confirmado' ? AppBadgeVariant.success : AppBadgeVariant.warning)),
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
                                    title: const Text('Editar Agendamento'),
                                    content: const Text('Módulo de alteração de horário (Aguardando integração).'),
                                    actions: [TextButton(onPressed: () => Navigator.pop(c), child: const Text('Fechar'))],
                                  ),
                                );
                              }
                            },
                          )),
                        ],
                      ),
                    );
                  }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
