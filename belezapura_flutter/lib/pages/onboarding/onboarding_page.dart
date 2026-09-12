import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';
import 'onboarding_controller.dart';

final _steps = [
  {'id': 1, 'icon': LucideIcons.store, 'label': "Dados do salão", 'sub': "Informações básicas"},
  {'id': 2, 'icon': LucideIcons.image, 'label': "Logo e fotos", 'sub': "Identidade visual"},
  {'id': 3, 'icon': LucideIcons.scissors, 'label': "Serviços", 'sub': "O que você oferece"},
  {'id': 4, 'icon': LucideIcons.userCheck, 'label': "Profissionais", 'sub': "Sua equipe"},
  {'id': 5, 'icon': LucideIcons.clock, 'label': "Horários", 'sub': "Quando você atende"},
  {'id': 6, 'icon': LucideIcons.creditCard, 'label': "PIX", 'sub': "Receba online"},
  {'id': 7, 'icon': LucideIcons.globe, 'label': "Publicar", 'sub': "Sua página no ar"},
];

class OnboardingPage extends StatefulWidget {
  final VoidCallback onFinish;

  const OnboardingPage({super.key, required this.onFinish});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final OnboardingController _controller = OnboardingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        if (_controller.done) {
          return _DoneScreen(controller: _controller, onFinish: widget.onFinish);
        }

        final currentStep = _steps[_controller.step - 1];

        return Container(
          color: AppTheme.background,
          child: Column(
            children: [
              _OnboardingHeader(step: _controller.step),
              Expanded(
                child: SingleChildScrollView(
                  child: Center(
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 600),
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Icon(currentStep['icon'] as IconData, color: AppTheme.primary),
                              ),
                              const SizedBox(width: 16),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(currentStep['label'] as String, style: const TextStyle(fontFamily: 'Fraunces', fontSize: 24)),
                                  Text(currentStep['sub'] as String, style: const TextStyle(color: AppTheme.mutedForeground, fontSize: 14)),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          
                          // Render Step Content
                          _buildStepContent(),
                          
                          const SizedBox(height: 32),
                          const Divider(),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              AppButton(
                                label: 'Voltar',
                                variant: AppButtonVariant.ghost,
                                icon: LucideIcons.arrowLeft,
                                onPressed: _controller.step > 1 ? _controller.back : null,
                              ),
                              Row(
                                children: [
                                  Text('${_controller.step} / ${_steps.length}', style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                                  const SizedBox(width: 16),
                                  AppButton(
                                    label: _controller.step == 7 ? 'Publicar meu salão' : 'Continuar',
                                    icon: _controller.step == 7 ? LucideIcons.sparkles : LucideIcons.arrowRight,
                                    onPressed: _controller.next,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStepContent() {
    switch (_controller.step) {
      case 1:
        return _Step1(controller: _controller);
      case 2:
        return const _Step2();
      case 3:
        return _Step3(controller: _controller);
      case 4:
        return _Step4(controller: _controller);
      case 5:
        return _Step5(controller: _controller);
      case 6:
        return _Step6(controller: _controller);
      case 7:
        return _Step7(controller: _controller);
      default:
        return const SizedBox.shrink();
    }
  }
}

// ... Implementação dos passos isolados para não inflar a árvore ...
class _OnboardingHeader extends StatelessWidget {
  final int step;
  const _OnboardingHeader({required this.step});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: const BoxDecoration(
        color: AppTheme.background,
        border: Border(bottom: BorderSide(color: AppTheme.border)),
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(color: AppTheme.primary, borderRadius: BorderRadius.circular(8)),
                        child: const Icon(LucideIcons.sparkles, size: 14, color: Colors.white),
                      ),
                      const SizedBox(width: 8),
                      const Text('beautyOS', style: TextStyle(fontFamily: 'Fraunces', fontWeight: FontWeight.w500)),
                    ],
                  ),
                  Text('Etapa $step de ${_steps.length}', style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: _steps.map((s) {
                  final id = s['id'] as int;
                  return Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 32, height: 32,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: id < step ? Colors.green : id == step ? AppTheme.primary : AppTheme.muted,
                          ),
                          child: Center(
                            child: id < step
                              ? const Icon(LucideIcons.check, size: 16, color: Colors.white)
                              : Text(id.toString(), style: TextStyle(color: id == step ? Colors.white : AppTheme.mutedForeground, fontWeight: FontWeight.bold, fontSize: 12)),
                          ),
                        ),
                        if (id != _steps.length)
                          Expanded(
                            child: Container(
                              height: 2,
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              color: id < step ? Colors.green.shade400 : AppTheme.border,
                            ),
                          ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Step1 extends StatelessWidget {
  final OnboardingController controller;
  const _Step1({required this.controller});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: AppInput(
              label: 'Nome do salão *', 
              controller: TextEditingController(text: controller.salonName)..addListener((() => controller.salonName = '')), 
              // Simplificado para prototype
            )),
            const SizedBox(width: 16),
            const Expanded(child: AppInput(label: 'Telefone / WhatsApp *', hintText: '(11) 99999-0000')),
          ],
        ),
        const SizedBox(height: 16),
        const AppInput(label: 'Endereço completo', hintText: 'Rua, número, bairro, cidade'),
      ],
    );
  }
}

class _Step2 extends StatelessWidget {
  const _Step2();
  @override
  Widget build(BuildContext context) => const Text('Configuração de Logo e Galeria (Em desenvolvimento)', style: TextStyle(color: AppTheme.mutedForeground));
}

class _Step3 extends StatelessWidget {
  final OnboardingController controller;
  const _Step3({required this.controller});
  @override
  Widget build(BuildContext context) => const Text('Configuração de Serviços (Em desenvolvimento)', style: TextStyle(color: AppTheme.mutedForeground));
}

class _Step4 extends StatelessWidget {
  final OnboardingController controller;
  const _Step4({required this.controller});
  @override
  Widget build(BuildContext context) => const Text('Configuração de Profissionais (Em desenvolvimento)', style: TextStyle(color: AppTheme.mutedForeground));
}

class _Step5 extends StatelessWidget {
  final OnboardingController controller;
  const _Step5({required this.controller});
  @override
  Widget build(BuildContext context) => const Text('Configuração de Horários (Em desenvolvimento)', style: TextStyle(color: AppTheme.mutedForeground));
}

class _Step6 extends StatelessWidget {
  final OnboardingController controller;
  const _Step6({required this.controller});
  @override
  Widget build(BuildContext context) => const Text('Configuração de PIX (Em desenvolvimento)', style: TextStyle(color: AppTheme.mutedForeground));
}

class _Step7 extends StatelessWidget {
  final OnboardingController controller;
  const _Step7({required this.controller});
  @override
  Widget build(BuildContext context) => const Text('Resumo (Em desenvolvimento)', style: TextStyle(color: AppTheme.mutedForeground));
}

class _DoneScreen extends StatelessWidget {
  final OnboardingController controller;
  final VoidCallback onFinish;

  const _DoneScreen({required this.controller, required this.onFinish});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(color: Colors.green.shade100, shape: BoxShape.circle),
            child: Icon(LucideIcons.sparkles, size: 40, color: Colors.green.shade600),
          ),
          const SizedBox(height: 24),
          Text('${controller.salonName} está pronto!', style: const TextStyle(fontFamily: 'Fraunces', fontSize: 32)),
          const SizedBox(height: 8),
          const Text('Seu salão está pronto para receber agendamentos.', style: TextStyle(color: AppTheme.mutedForeground)),
          const SizedBox(height: 32),
          AppButton(label: 'Ir para o Dashboard', onPressed: onFinish, size: AppButtonSize.lg),
        ],
      ),
    );
  }
}
