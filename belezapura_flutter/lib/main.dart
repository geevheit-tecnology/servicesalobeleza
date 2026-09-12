import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/pages/marketing/marketing_page.dart';
import 'package:belezapura_flutter/pages/onboarding/onboarding_page.dart';
import 'package:belezapura_flutter/pages/client/client_page.dart';
import 'package:belezapura_flutter/pages/salon/salon_page.dart';
import 'package:belezapura_flutter/pages/superadmin/superadmin_page.dart';

void main() {
  runApp(const BeautyOSApp());
}

class BeautyOSApp extends StatelessWidget {
  const BeautyOSApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'beautyOS Protótipo',
      theme: AppTheme.lightTheme,
      home: const PrototypeHost(),
      debugShowCheckedModeBanner: false,
    );
  }
}

enum AppView { marketing, client, salon, superadmin, onboarding }

class PrototypeHost extends StatefulWidget {
  const PrototypeHost({super.key});

  @override
  State<PrototypeHost> createState() => _PrototypeHostState();
}

class _PrototypeHostState extends State<PrototypeHost> {
  AppView _currentView = AppView.marketing;

  final Map<AppView, Map<String, dynamic>> _tabs = {
    AppView.marketing: {'label': 'Landing Page', 'sub': 'SaaS', 'icon': LucideIcons.sparkles},
    AppView.client: {'label': 'Cliente Final', 'sub': 'Mobile', 'icon': LucideIcons.globe},
    AppView.salon: {'label': 'Painel do Salão', 'sub': 'Dashboard', 'icon': LucideIcons.layoutDashboard},
    AppView.superadmin: {'label': 'Super Admin', 'sub': 'Plataforma', 'icon': LucideIcons.shieldCheck},
    AppView.onboarding: {'label': 'Onboarding', 'sub': 'Novo salão', 'icon': LucideIcons.rocket},
  };

  Widget _buildContent() {
    switch (_currentView) {
      case AppView.marketing:
        return MarketingPage(
          onNavigate: (viewName) {
            final viewMap = {
              'client': AppView.client,
              'salon': AppView.salon,
              'superadmin': AppView.superadmin,
              'onboarding': AppView.onboarding,
            };
            if (viewMap.containsKey(viewName)) {
              setState(() => _currentView = viewMap[viewName]!);
            }
          },
        );
      case AppView.client:
        return const ClientPage();
      case AppView.salon:
        return const SalonPage();
      case AppView.superadmin:
        return const SuperAdminPage();
      case AppView.onboarding:
        return OnboardingPage(
          onFinish: () => setState(() => _currentView = AppView.salon),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Prototype nav strip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppTheme.foreground.withValues(alpha: 0.96),
            ),
            child: Row(
              children: [
                // Logo section
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Center(
                    child: Icon(LucideIcons.sparkles, size: 10, color: Colors.white),
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'beautyOS',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontFamily: 'Fraunces',
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Icon(LucideIcons.chevronRight, size: 12, color: Colors.white.withValues(alpha: 0.3)),
                ),
                Text(
                  'PROTÓTIPO',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                    color: Colors.white.withValues(alpha: 0.3),
                  ),
                ),
                const SizedBox(width: 16),
                
                // Tabs
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: AppView.values.map((view) {
                        final tab = _tabs[view]!;
                        final isSelected = _currentView == view;
                        return Padding(
                          padding: const EdgeInsets.only(right: 4),
                          child: InkWell(
                            onTap: () => setState(() => _currentView = view),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.white.withValues(alpha: 0.15) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    tab['icon'] as IconData,
                                    size: 12,
                                    color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.6),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    tab['label'] as String,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.7),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  if (MediaQuery.of(context).size.width > 600)
                                    Text(
                                      tab['sub'] as String,
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: isSelected ? Colors.white.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.25),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Main Content
          Expanded(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }
}
