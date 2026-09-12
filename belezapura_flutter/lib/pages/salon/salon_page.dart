import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'salon_controller.dart';
import 'views/dashboard_view.dart';
import 'views/agenda_view.dart';
import 'views/appointments_view.dart';
import 'views/clients_view.dart';
import 'views/financeiro_view.dart';
import 'views/comissoes_view.dart';
import 'views/avaliacoes_view.dart';
import 'views/pagina_salao_view.dart';
import 'views/servicos_view.dart';
import 'views/profissionais_view.dart';
import 'views/horarios_view.dart';
import 'views/relatorios_view.dart';
import 'views/configuracoes_view.dart';

final _navItems = [
  {'id': SalonTab.dashboard, 'label': 'Dashboard', 'icon': LucideIcons.layoutDashboard},
  {'id': SalonTab.agenda, 'label': 'Agenda', 'icon': LucideIcons.calendar},
  {'id': SalonTab.agendamentos, 'label': 'Agendamentos', 'icon': LucideIcons.listOrdered},
  {'id': SalonTab.clientes, 'label': 'Clientes', 'icon': LucideIcons.users},
  {'id': SalonTab.servicos, 'label': 'Serviços', 'icon': LucideIcons.scissors},
  {'id': SalonTab.profissionais, 'label': 'Profissionais', 'icon': LucideIcons.userCheck},
  {'id': SalonTab.financeiro, 'label': 'Financeiro', 'icon': LucideIcons.dollarSign},
  {'id': SalonTab.comissoes, 'label': 'Comissões', 'icon': LucideIcons.percent},
  {'id': SalonTab.pagina, 'label': 'Página do Salão', 'icon': LucideIcons.globe},
  {'id': SalonTab.avaliacoes, 'label': 'Avaliações', 'icon': LucideIcons.star},
  {'id': SalonTab.relatorios, 'label': 'Relatórios', 'icon': LucideIcons.barChart2},
  {'id': SalonTab.configuracoes, 'label': 'Configurações', 'icon': LucideIcons.settings},
];

class SalonPage extends StatefulWidget {
  const SalonPage({super.key});

  @override
  State<SalonPage> createState() => _SalonPageState();
}

class _SalonPageState extends State<SalonPage> {
  final SalonController _controller = SalonController();

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
          // Sidebar
          Container(
            width: 250,
            decoration: const BoxDecoration(
              color: AppTheme.card,
              border: Border(right: BorderSide(color: AppTheme.border)),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  alignment: Alignment.centerLeft,
                  child: Row(
                    children: [
                      Container(
                        width: 32, height: 32,
                        decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(8)),
                        child: const Icon(LucideIcons.sparkles, size: 16, color: Colors.white),
                      ),
                      const SizedBox(width: 12),
                      const Text('beautyOS', style: TextStyle(fontFamily: 'Fraunces', fontSize: 20, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _controller,
                    builder: (context, _) {
                      return ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        itemCount: _navItems.length,
                        itemBuilder: (context, index) {
                          final item = _navItems[index];
                          final isSelected = _controller.currentTab == item['id'];
                          
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: InkWell(
                              onTap: () => _controller.setTab(item['id'] as SalonTab),
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppTheme.primary.withValues(alpha: 0.1) : Colors.transparent,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      item['icon'] as IconData,
                                      size: 18,
                                      color: isSelected ? AppTheme.primary : AppTheme.mutedForeground,
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      item['label'] as String,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                        color: isSelected ? AppTheme.primary : AppTheme.mutedForeground,
                                      ),
                                    ),
                                  ],
                                ),
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
                  child: Row(
                    children: [
                      Container(width: 40, height: 40, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.secondary), child: const Icon(LucideIcons.user, size: 20)),
                      const SizedBox(width: 12),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Salão Rosé', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          Text('Plano Pro', style: TextStyle(color: AppTheme.mutedForeground, fontSize: 12)),
                        ],
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(LucideIcons.logOut, size: 18, color: AppTheme.mutedForeground),
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
            child: ListenableBuilder(
              listenable: _controller,
              builder: (context, _) {
                switch (_controller.currentTab) {
                  case SalonTab.dashboard:
                    return const DashboardView();
                  case SalonTab.agenda:
                    return const AgendaView();
                  case SalonTab.agendamentos:
                    return const AppointmentsView();
                  case SalonTab.clientes:
                    return const ClientsView();
                  case SalonTab.financeiro:
                    return const FinanceiroView();
                  case SalonTab.comissoes:
                    return const ComissoesView();
                  case SalonTab.avaliacoes:
                    return const AvaliacoesView();
                  case SalonTab.pagina:
                    return const PaginaSalaoView();
                  case SalonTab.servicos:
                    return const ServicosView();
                  case SalonTab.profissionais:
                    return const ProfissionaisView();
                  case SalonTab.horarios:
                    return const HorariosView();
                  case SalonTab.relatorios:
                    return const RelatoriosView();
                  case SalonTab.configuracoes:
                    return const ConfiguracoesView();
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}
