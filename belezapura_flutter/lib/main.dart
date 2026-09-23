import 'package:flutter/material.dart';

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
      body: _buildContent(),
    );
  }
}
