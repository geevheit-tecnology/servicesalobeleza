import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';
import 'superadmin_controller.dart';
import 'views/overview_view.dart';
import 'views/saloes_view.dart';
import 'views/unidades_view.dart';
import 'views/assinaturas_view.dart';
import 'views/planos_view.dart';
import 'views/pagamentos_view.dart';
import 'views/usuarios_view.dart';
import 'views/suporte_view.dart';
import 'views/configuracoes_admin_view.dart';

final _navItems = [
  {'id': AdminTab.overview, 'label': 'Visão geral', 'icon': LucideIcons.layoutDashboard},
  {'id': AdminTab.saloes, 'label': 'Salões', 'icon': LucideIcons.store},
  {'id': AdminTab.unidades, 'label': 'Unidades', 'icon': LucideIcons.building2},
  {'id': AdminTab.assinaturas, 'label': 'Assinaturas', 'icon': LucideIcons.creditCard},
  {'id': AdminTab.planos, 'label': 'Planos', 'icon': LucideIcons.package},
  {'id': AdminTab.pagamentos, 'label': 'Pagamentos', 'icon': LucideIcons.creditCard},
  {'id': AdminTab.usuarios, 'label': 'Usuários', 'icon': LucideIcons.users},
  {'id': AdminTab.suporte, 'label': 'Suporte', 'icon': LucideIcons.headphones},
  {'id': AdminTab.configuracoes, 'label': 'Configurações', 'icon': LucideIcons.settings},
];

class SuperAdminPage extends StatefulWidget {
  const SuperAdminPage({super.key});

  @override
  State<SuperAdminPage> createState() => _SuperAdminPageState();
}

class _SuperAdminPageState extends State<SuperAdminPage> {
  final SuperadminController _controller = SuperadminController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: Row(
        children: [
          // Dark Sidebar
          Container(
            width: 250,
            decoration: const BoxDecoration(color: AppTheme.foreground),
            child: Column(
              children: [
                Container(
                  height: 64,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  decoration: BoxDecoration(border: Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.1)))),
                  child: Row(
                    children: [
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(8)),
                        child: const Icon(LucideIcons.sparkles, size: 14, color: Colors.white),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('beautyOS', style: TextStyle(fontFamily: 'Fraunces', fontSize: 16, fontWeight: FontWeight.w500, color: Colors.white)),
                          Text('Super Admin', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _controller,
                    builder: (context, _) {
                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        itemCount: _navItems.length,
                        itemBuilder: (context, index) {
                          final item = _navItems[index];
                          final isSelected = _controller.currentTab == item['id'];
                          
                          return InkWell(
                            onTap: () => _controller.setTab(item['id'] as AdminTab),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              color: isSelected ? Colors.white.withValues(alpha: 0.15) : Colors.transparent,
                              child: Row(
                                children: [
                                  Icon(
                                    item['icon'] as IconData,
                                    size: 16,
                                    color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.5),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    item['label'] as String,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                      color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.5),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.1)))),
                  child: Row(
                    children: [
                      const AppAvatar(name: 'Admin beautyOS', radius: 16),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Admin beautyOS', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Colors.white)),
                          Text('Super Administrador', style: TextStyle(color: Colors.white.withValues(alpha: 0.4), fontSize: 12)),
                        ],
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(LucideIcons.logOut, size: 16, color: Colors.white54),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Main Content
          Expanded(
            child: Column(
              children: [
                // Header
                Container(
                  height: 64,
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  decoration: const BoxDecoration(color: AppTheme.card, border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ListenableBuilder(
                        listenable: _controller,
                        builder: (context, _) => Text(
                          _navItems.firstWhere((i) => i['id'] == _controller.currentTab)['label'] as String,
                          style: const TextStyle(fontWeight: FontWeight.w500, color: AppTheme.mutedForeground),
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(icon: const Icon(LucideIcons.bell, size: 20, color: AppTheme.mutedForeground), onPressed: () {}),
                          const SizedBox(width: 8),
                          const AppAvatar(name: 'Admin beautyOS', radius: 16),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _controller,
                    builder: (context, _) {
                      switch (_controller.currentTab) {
                        case AdminTab.overview:
                          return const OverviewView();
                        case AdminTab.saloes:
                          return const SaloesView();
                        case AdminTab.assinaturas:
                          return const AssinaturasView();
                        case AdminTab.planos:
                          return const PlanosView();
                        case AdminTab.suporte:
                          return const SuporteView();
                        case AdminTab.unidades:
                          return const UnidadesView();
                        case AdminTab.pagamentos:
                          return const PagamentosView();
                        case AdminTab.usuarios:
                          return const UsuariosView();
                        case AdminTab.configuracoes:
                          return const ConfiguracoesAdminView();
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
