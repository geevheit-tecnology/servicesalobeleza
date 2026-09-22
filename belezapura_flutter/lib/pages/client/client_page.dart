import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';
import 'client_controller.dart';

class ClientPage extends StatefulWidget {
  const ClientPage({super.key});

  @override
  State<ClientPage> createState() => _ClientPageState();
}

class _ClientPageState extends State<ClientPage> {
  final ClientController _controller = ClientController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppTheme.muted.withValues(alpha: 0.3),
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
      alignment: Alignment.center,
      child: Column(
        children: [
          Expanded(
            child: Container(
              width: double.infinity,
              constraints: const BoxConstraints(maxWidth: 400),
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.border),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10)),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: ListenableBuilder(
                listenable: _controller,
                builder: (context, _) {
                  if (_controller.step == BookingStep.salon) {
                    return _SalonView(controller: _controller);
                  }
                  return _BookingFlow(controller: _controller);
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Visualização mobile — experiência do cliente final', style: TextStyle(color: AppTheme.mutedForeground, fontSize: 12)),
        ],
      ),
    );
  }
}

class _SalonView extends StatelessWidget {
  final ClientController controller;
  const _SalonView({required this.controller});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Stack(
            children: [
              Image.network('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop&auto=format', height: 220, width: double.infinity, fit: BoxFit.cover),
              Container(
                height: 220,
                decoration: BoxDecoration(
                  gradient: LinearGradient(begin: Alignment.bottomCenter, end: Alignment.topCenter, colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent]),
                ),
              ),
              Positioned(
                bottom: 16, left: 16, right: 16,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 48, height: 48,
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                          child: const Icon(LucideIcons.sparkles, color: AppTheme.primary),
                        ),
                        const SizedBox(height: 8),
                        Text(controller.salonName, style: const TextStyle(color: Colors.white, fontSize: 24, fontFamily: 'Fraunces')),
                        Text('Cabelo · Unhas · Estética', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
                      ],
                    ),
                    const AppStars(rating: 4.9, count: 327),
                  ],
                ),
              ),
            ],
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              AppButton(
                label: 'Agendar horário',
                icon: LucideIcons.calendar,
                size: AppButtonSize.lg,
                onPressed: () => controller.setStep(BookingStep.service),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(child: AppButton(label: 'WhatsApp', icon: LucideIcons.messageCircle, variant: AppButtonVariant.outline, size: AppButtonSize.sm)),
                  const SizedBox(width: 8),
                  Expanded(child: AppButton(label: 'Como chegar', icon: LucideIcons.mapPin, variant: AppButtonVariant.outline, size: AppButtonSize.sm)),
                ],
              ),
              const SizedBox(height: 24),
              const Text('Nossos serviços', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 12),
              ...controller.services.take(3).map((s) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s.name, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
                        Text(s.duration, style: const TextStyle(color: AppTheme.mutedForeground, fontSize: 12)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(s.price, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
                        InkWell(
                          onTap: () { controller.selectedService = s; controller.setStep(BookingStep.professional); },
                          child: const Text('Agendar', style: TextStyle(color: AppTheme.primary, fontSize: 12, decoration: TextDecoration.underline)),
                        ),
                      ],
                    ),
                  ],
                ),
              )),
              Center(
                child: TextButton(
                  onPressed: () => controller.setStep(BookingStep.service),
                  child: const Text('Ver todos →', style: TextStyle(color: AppTheme.primary)),
                ),
              ),
            ]),
          ),
        ),
      ],
    );
  }
}

class _BookingFlow extends StatelessWidget {
  final ClientController controller;
  const _BookingFlow({required this.controller});

  @override
  Widget build(BuildContext context) {
    String title = '';
    switch (controller.step) {
      case BookingStep.service: title = 'Escolha o serviço'; break;
      case BookingStep.professional: title = 'Profissional'; break;
      case BookingStep.date: title = 'Data'; break;
      case BookingStep.time: title = 'Horário'; break;
      case BookingStep.data: title = 'Seus dados'; break;
      case BookingStep.summary: title = 'Resumo'; break;
      case BookingStep.pix: title = 'Pagamento PIX'; break;
      case BookingStep.confirm: title = 'Confirmado!'; break;
      default: break;
    }

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
          child: Row(
            children: [
              if (controller.step != BookingStep.confirm)
                IconButton(icon: const Icon(LucideIcons.arrowLeft, size: 20), onPressed: controller.goBack),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              ),
              IconButton(icon: const Icon(LucideIcons.x, size: 20), onPressed: () => controller.setStep(BookingStep.salon)),
            ],
          ),
        ),
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: _buildStepContent(context),
          ),
        ),
      ],
    );
  }

  Widget _buildStepContent(BuildContext context) {
    switch (controller.step) {
      case BookingStep.service:
        return Column(
          children: controller.services.map((s) => InkWell(
            onTap: () { controller.selectedService = s; controller.setStep(BookingStep.professional); },
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.border),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(s.img, width: 64, height: 64, fit: BoxFit.cover)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text(s.desc, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(s.duration, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                            Text(s.price, style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primary)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          )).toList(),
        );
      case BookingStep.professional:
        return Column(
          children: controller.professionals.map((p) => InkWell(
            onTap: () { controller.selectedPro = p; controller.setStep(BookingStep.date); },
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(12)),
              child: Row(
                children: [
                  p.id == 0 
                    ? Container(width: 48, height: 48, decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.secondary), child: const Icon(LucideIcons.user))
                    : AppAvatar(name: p.name, src: p.img, radius: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        if (p.specialty.isNotEmpty) Text(p.specialty, style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
                      ],
                    ),
                  ),
                  const Icon(LucideIcons.chevronRight, size: 16, color: AppTheme.mutedForeground),
                ],
              ),
            ),
          )).toList(),
        );
      case BookingStep.date:
        return Column(
          children: [
            const Text('Selecione uma data para simplificar o protótipo.'),
            const SizedBox(height: 16),
            AppButton(label: 'Dia 15 de Outubro', onPressed: () { controller.selectedDate = 15; controller.setStep(BookingStep.time); }),
          ],
        );
      case BookingStep.time:
        return Column(
          children: [
            const Text('Horários disponíveis para 15 de Outubro'),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8, runSpacing: 8,
              children: ['09:00', '10:00', '11:00', '14:00', '15:00'].map((t) => InkWell(
                onTap: () { controller.selectedTime = t; controller.setStep(BookingStep.data); },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(12)),
                  child: Text(t),
                ),
              )).toList(),
            ),
          ],
        );
      case BookingStep.data:
        return Column(
          children: [
            const AppInput(label: 'Nome completo'),
            const SizedBox(height: 12),
            const AppInput(label: 'Celular / WhatsApp'),
            const SizedBox(height: 12),
            const AppInput(label: 'E-mail (opcional)'),
            const SizedBox(height: 24),
            AppButton(label: 'Continuar', onPressed: () => controller.setStep(BookingStep.summary)),
          ],
        );
      case BookingStep.summary:
        return Column(
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.circular(16)),
              child: Column(
                children: [
                  const Text('Resumo do agendamento', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Serviço'), Text(controller.selectedService?.name ?? '')]),
                  const SizedBox(height: 8),
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [const Text('Total'), Text(controller.selectedService?.price ?? '', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold))]),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.orange.shade200)),
              child: const Column(
                children: [
                  Text('Sinal para reservar', style: TextStyle(color: Colors.orange)),
                  Text('R\$ 30,00', style: TextStyle(fontFamily: 'Fraunces', fontSize: 24, color: Colors.deepOrange)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            AppButton(label: 'Pagar sinal e confirmar', onPressed: () => controller.setStep(BookingStep.pix)),
          ],
        );
      case BookingStep.pix:
        return Column(
          children: [
            AppBadge(text: controller.paymentState == 'pending' ? 'Aguardando pagamento' : 'Pagamento confirmado', variant: AppBadgeVariant.warning),
            const SizedBox(height: 16),
            const Text('R\$ 30,00', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, color: AppTheme.primary)),
            const SizedBox(height: 24),
            AppButton(label: controller.paymentState == 'confirmed' ? 'Confirmado!' : 'Simular pagamento', onPressed: controller.simulatePayment),
          ],
        );
      case BookingStep.confirm:
        return Column(
          children: [
            const Icon(LucideIcons.checkCircle, size: 64, color: Colors.green),
            const SizedBox(height: 16),
            const Text('Confirmado!', style: TextStyle(fontFamily: 'Fraunces', fontSize: 24, color: Colors.green)),
            const SizedBox(height: 24),
            AppButton(label: 'Voltar ao início', onPressed: () => controller.setStep(BookingStep.salon)),
          ],
        );
      default: return const SizedBox.shrink();
    }
  }
}
