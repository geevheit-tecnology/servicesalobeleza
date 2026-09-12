import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

// Constantes de imagens
const String _imgHero = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&h=700&fit=crop&auto=format';
const String _imgBooking = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop&auto=format';
const String _imgPix = 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&auto=format';
const String _imgTeam = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop&auto=format';
const String _imgPage = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=400&fit=crop&auto=format';
const String _imgMulti = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format';

class MarketingPage extends StatelessWidget {
  final Function(String) onNavigate;

  const MarketingPage({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: CustomScrollView(
        slivers: [
          _MarketingHeader(onNavigate: onNavigate),
          SliverToBoxAdapter(child: _HeroSection(onNavigate: onNavigate)),
          const SliverToBoxAdapter(child: _BenefitsSection()),
          const SliverToBoxAdapter(child: _FeaturesSection()),
          const SliverToBoxAdapter(child: _HowItWorksSection()),
          const SliverToBoxAdapter(child: _TestimonialsSection()),
          const SliverToBoxAdapter(child: _PlansSection()),
          SliverToBoxAdapter(child: _FinalCtaSection(onNavigate: onNavigate)),
          const SliverToBoxAdapter(child: _FooterSection()),
        ],
      ),
    );
  }
}

class _MarketingHeader extends StatelessWidget {
  final Function(String) onNavigate;

  const _MarketingHeader({required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      backgroundColor: AppTheme.background.withValues(alpha: 0.9),
      elevation: 0,
      title: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(LucideIcons.sparkles, size: 16, color: Colors.white),
          ),
          const SizedBox(width: 8),
          const Text('beautyOS', style: TextStyle(fontFamily: 'Fraunces', fontSize: 20, color: AppTheme.foreground)),
        ],
      ),
      actions: [
        if (MediaQuery.of(context).size.width > 600) ...[
          AppButton(label: 'Entrar', variant: AppButtonVariant.ghost, onPressed: () {}),
          const SizedBox(width: 8),
        ],
        AppButton(
          label: 'Começar grátis',
          onPressed: () => onNavigate('salon'),
        ),
        const SizedBox(width: 16),
      ],
    );
  }
}

class _HeroSection extends StatelessWidget {
  final Function(String) onNavigate;

  const _HeroSection({required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        SizedBox(
          height: 600,
          width: double.infinity,
          child: Image.network(_imgHero, fit: BoxFit.cover),
        ),
        Container(
          height: 600,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppTheme.foreground.withValues(alpha: 0.9),
                AppTheme.foreground.withValues(alpha: 0.6),
                Colors.transparent,
              ],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
          ),
        ),
        Positioned(
          left: 0,
          right: 0,
          top: 120,
          child: Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 1100),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(LucideIcons.sparkles, color: Colors.white, size: 12),
                        SizedBox(width: 6),
                        Text('Nova plataforma para salões de beleza', style: TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Seu salão mais organizado.\nSeus clientes mais conectados.',
                    style: TextStyle(
                      fontFamily: 'Fraunces',
                      fontSize: 48,
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Agende, receba, organize e acompanhe seu salão em um só lugar. Sem aplicativo para instalar.',
                    style: TextStyle(color: Colors.white70, fontSize: 18),
                  ),
                  const SizedBox(height: 32),
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: () => onNavigate('salon'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppTheme.foreground,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        child: const Row(
                          children: [
                            Text('Começar agora'),
                            SizedBox(width: 8),
                            Icon(LucideIcons.arrowRight, size: 16),
                          ],
                        ),
                      ),
                      const SizedBox(width: 16),
                      OutlinedButton(
                        onPressed: () => onNavigate('client'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.4)),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                        ),
                        child: const Text('Ver como cliente'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _BenefitsSection extends StatelessWidget {
  const _BenefitsSection();

  @override
  Widget build(BuildContext context) {
    final benefits = [
      {'icon': LucideIcons.calendar, 'label': 'Agendamento online'},
      {'icon': LucideIcons.creditCard, 'label': 'Pagamento via PIX'},
      {'icon': LucideIcons.users, 'label': 'Gestão de clientes'},
      {'icon': LucideIcons.sparkles, 'label': 'Gestão de equipe'},
      {'icon': LucideIcons.barChart3, 'label': 'Controle financeiro'},
      {'icon': LucideIcons.store, 'label': 'Página profissional'},
    ];

    return Container(
      color: AppTheme.secondary,
      padding: const EdgeInsets.symmetric(vertical: 40),
      child: Center(
        child: Wrap(
          spacing: 32,
          runSpacing: 32,
          alignment: WrapAlignment.center,
          children: benefits.map((b) {
            return SizedBox(
              width: 140,
              child: Column(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(b['icon'] as IconData, color: AppTheme.primary),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    b['label'] as String,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.foreground),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class _FeaturesSection extends StatelessWidget {
  const _FeaturesSection();

  @override
  Widget build(BuildContext context) {
    final features = [
      {'icon': LucideIcons.calendar, 'title': 'Agendamento Online', 'desc': 'Seus clientes agendam de qualquer lugar, sem instalar aplicativo.', 'img': _imgBooking},
      {'icon': LucideIcons.creditCard, 'title': 'Pagamentos via PIX', 'desc': 'Receba sinais e pagamentos via PIX. Confirmação automática.', 'img': _imgPix},
      {'icon': LucideIcons.barChart3, 'title': 'Gestão Completa', 'desc': 'Agenda, clientes, equipe e financeiro em um só painel.', 'img': _imgTeam},
      {'icon': LucideIcons.store, 'title': 'Página Profissional', 'desc': 'Tenha sua presença digital com agendamento integrado.', 'img': _imgPage},
      {'icon': LucideIcons.users, 'title': 'Multi-unidade', 'desc': 'Gerencie várias unidades e equipes em um só lugar.', 'img': _imgMulti},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Column(
        children: [
          const AppBadge(text: 'Funcionalidades'),
          const SizedBox(height: 16),
          const Text('Tudo que seu salão precisa', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32)),
          const SizedBox(height: 16),
          const Text('Uma plataforma completa para gestão de negócios de beleza.', style: TextStyle(color: AppTheme.mutedForeground, fontSize: 18)),
          const SizedBox(height: 48),
          Wrap(
            spacing: 24,
            runSpacing: 24,
            alignment: WrapAlignment.center,
            children: features.map((f) {
              return Container(
                width: 320,
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.border),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                      child: Image.network(f['img'] as String, height: 180, width: double.infinity, fit: BoxFit.cover),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppTheme.secondary,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Icon(f['icon'] as IconData, size: 16, color: AppTheme.primary),
                              ),
                              const SizedBox(width: 8),
                              Text(f['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(f['desc'] as String, style: const TextStyle(color: AppTheme.mutedForeground)),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _HowItWorksSection extends StatelessWidget {
  const _HowItWorksSection();

  @override
  Widget build(BuildContext context) {
    final steps = [
      {'n': '01', 'title': 'Cadastre seu salão', 'desc': 'Configure em minutos.'},
      {'n': '02', 'title': 'Serviços', 'desc': 'Adicione preços e fotos.'},
      {'n': '03', 'title': 'Publique', 'desc': 'Link pronto para uso.'},
      {'n': '04', 'title': 'Agendamentos', 'desc': 'Receba direto no painel.'},
    ];

    return Container(
      color: AppTheme.secondary.withValues(alpha: 0.5),
      padding: const EdgeInsets.symmetric(vertical: 80, horizontal: 24),
      child: Column(
        children: [
          const AppBadge(text: 'Como funciona', variant: AppBadgeVariant.outline),
          const SizedBox(height: 16),
          const Text('Em 4 passos, seu salão online', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32)),
          const SizedBox(height: 48),
          Wrap(
            spacing: 24,
            runSpacing: 24,
            alignment: WrapAlignment.center,
            children: steps.map((s) {
              return Container(
                width: 240,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppTheme.card,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s['n']!, style: TextStyle(fontFamily: 'JetBrains Mono', fontSize: 32, color: AppTheme.primary.withValues(alpha: 0.2))),
                    const SizedBox(height: 16),
                    Text(s['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    Text(s['desc']!, style: const TextStyle(color: AppTheme.mutedForeground)),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _TestimonialsSection extends StatelessWidget {
  const _TestimonialsSection();

  @override
  Widget build(BuildContext context) {
    // Implementação simplificada
    return Container();
  }
}

class _PlansSection extends StatelessWidget {
  const _PlansSection();

  @override
  Widget build(BuildContext context) {
    // Implementação simplificada
    return Container();
  }
}

class _FinalCtaSection extends StatelessWidget {
  final Function(String) onNavigate;

  const _FinalCtaSection({required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 24),
      child: Column(
        children: [
          const Text(
            'Seu salão. Sua agenda.',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'Fraunces', fontSize: 40),
          ),
          const Text(
            'Seu negócio.',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'Fraunces', fontSize: 40, fontStyle: FontStyle.italic, color: AppTheme.primary),
          ),
          const SizedBox(height: 32),
          AppButton(
            label: 'Começar grátis agora',
            size: AppButtonSize.lg,
            icon: LucideIcons.arrowRight,
            onPressed: () => onNavigate('salon'),
          ),
        ],
      ),
    );
  }
}

class _FooterSection extends StatelessWidget {
  const _FooterSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppTheme.muted.withValues(alpha: 0.4),
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      child: const Center(
        child: Text('© 2026 Geevheit Software Technology. Todos os direitos reservados.', style: TextStyle(color: AppTheme.mutedForeground)),
      ),
    );
  }
}
