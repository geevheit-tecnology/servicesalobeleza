import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class ClientsView extends StatelessWidget {
  const ClientsView({super.key});

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
              const Text('Clientes', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Novo cliente', icon: LucideIcons.plus, onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Novo Cliente (Manual)'),
                    content: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        AppInput(label: 'Nome completo', hintText: 'Ex: Maria Silva'),
                        SizedBox(height: 16),
                        AppInput(label: 'Telefone / WhatsApp', hintText: '(11) 90000-0000'),
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
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: const Row(
              children: [
                Icon(LucideIcons.search, size: 16, color: AppTheme.mutedForeground),
                SizedBox(width: 12),
                Text('Buscar cliente...', style: TextStyle(color: AppTheme.mutedForeground)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                flex: 2,
                child: Container(
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: const BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
                        child: const Row(
                          children: [
                            Expanded(flex: 2, child: Text('Cliente', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                            Expanded(flex: 2, child: Text('Telefone', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                            Expanded(flex: 1, child: Text('Último atend.', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                            Expanded(flex: 1, child: Text('Visitas', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                            Expanded(flex: 1, child: Text('Total gasto', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                            SizedBox(width: 32),
                          ],
                        ),
                      ),
                      ...[
                        {'c': 'Fernanda Lima', 'tel': '(11) 98765-1234', 'last': 'Hoje', 'vis': '24', 'total': 'R\$ 3.240', 'tag': 'VIP'},
                        {'c': 'Camila Ferreira', 'tel': '(11) 97654-2345', 'last': '15/10/2024', 'vis': '12', 'total': 'R\$ 960'},
                        {'c': 'Beatriz Rocha', 'tel': '(11) 96543-3456', 'last': '12/10/2024', 'vis': '8', 'total': 'R\$ 620', 'tag': 'Aniversário'},
                      ].map((c) => InkWell(
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: Text('Detalhes: ${c['c']}'),
                              content: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Telefone: ${c['tel']}'),
                                  Text('Último atendimento: ${c['last']}'),
                                  Text('Visitas: ${c['vis']}'),
                                  Text('Total gasto: ${c['total']}'),
                                  const SizedBox(height: 16),
                                  const Text('A visualização completa e edição do perfil será conectada à API.', style: TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                                ],
                              ),
                              actions: [
                                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Fechar')),
                              ],
                            ),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppTheme.border))),
                        child: Row(
                          children: [
                            Expanded(flex: 2, child: Row(children: [AppAvatar(name: c['c'] as String, radius: 12), const SizedBox(width: 8), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(c['c'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14), overflow: TextOverflow.ellipsis), if (c['tag'] != null) Text(c['tag'] as String, style: const TextStyle(fontSize: 10, color: Colors.purple, fontWeight: FontWeight.bold))]))])),
                            Expanded(flex: 2, child: Text(c['tel'] as String, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                            Expanded(flex: 1, child: Text(c['last'] as String, style: const TextStyle(fontSize: 14))),
                            Expanded(flex: 1, child: Text(c['vis'] as String, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))),
                            Expanded(flex: 1, child: Text(c['total'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.primary))),
                            SizedBox(width: 32, child: PopupMenuButton(
                              icon: const Icon(LucideIcons.moreHorizontal, size: 16, color: AppTheme.mutedForeground),
                              padding: EdgeInsets.zero,
                              itemBuilder: (context) => [
                                const PopupMenuItem(value: 'edit', child: Text('Editar')),
                                const PopupMenuItem(value: 'delete', child: Text('Excluir', style: TextStyle(color: Colors.red))),
                              ],
                              onSelected: (val) {
                                if (val == 'edit') {
                                  showDialog(
                                    context: context,
                                    builder: (c) => AlertDialog(
                                      title: const Text('Editar Cliente'),
                                      content: const Text('Formulário de edição de cliente (Aguardando integração).'),
                                      actions: [TextButton(onPressed: () => Navigator.pop(c), child: const Text('Fechar'))],
                                    ),
                                  );
                                }
                              },
                            )),
                          ],
                        ),
                      ))),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                flex: 1,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const AppAvatar(name: 'Fernanda Lima', radius: 24),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('Fernanda Lima', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                              Text('(11) 98765-1234', style: TextStyle(color: AppTheme.mutedForeground, fontSize: 14)),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [Text('Visitas', style: TextStyle(color: AppTheme.mutedForeground)), Text('24', style: TextStyle(fontWeight: FontWeight.w500))]),
                      const SizedBox(height: 12),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [Text('Total gasto', style: TextStyle(color: AppTheme.mutedForeground)), Text('R\$ 3.240', style: TextStyle(fontWeight: FontWeight.w500))]),
                      const SizedBox(height: 12),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [Text('Último atend.', style: TextStyle(color: AppTheme.mutedForeground)), Text('Hoje', style: TextStyle(fontWeight: FontWeight.w500))]),
                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 16),
                      const Text('Histórico recente', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground)),
                      const SizedBox(height: 12),
                      const Text('Escova Progressiva — Hoje', style: TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                      const SizedBox(height: 8),
                      const Text('Manicure — 01/10', style: TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
