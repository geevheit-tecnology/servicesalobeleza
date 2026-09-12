import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class PaginaSalaoView extends StatefulWidget {
  const PaginaSalaoView({super.key});

  @override
  State<PaginaSalaoView> createState() => _PaginaSalaoViewState();
}

class _PaginaSalaoViewState extends State<PaginaSalaoView> {
  String tab = 'desktop';

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
              const Text('Página do Salão', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              Row(
                children: [
                  AppButton(label: 'Visualizar', icon: LucideIcons.eye, variant: AppButtonVariant.outline, onPressed: () {}),
                  const SizedBox(width: 12),
                  AppButton(label: 'Publicar', icon: LucideIcons.globe, onPressed: () {}),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Personalizar página', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                      const SizedBox(height: 24),
                      ...[
                        {'l': 'Nome do salão', 'v': 'Salão Rosé'},
                        {'l': 'Descrição', 'v': 'Cabelo, unhas e estética com cuidado especial'},
                        {'l': 'Endereço', 'v': 'Rua das Flores, 142 — Moema, SP'},
                        {'l': 'Telefone', 'v': '(11) 99999-0000'},
                        {'l': 'WhatsApp', 'v': '(11) 99999-0000'},
                        {'l': 'Instagram', 'v': '@salarose'},
                      ].map((f) => Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(f['l']!, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.mutedForeground)),
                            const SizedBox(height: 4),
                            SizedBox(
                              height: 40,
                              child: TextField(
                                controller: TextEditingController(text: f['v']),
                                decoration: InputDecoration(
                                  filled: true,
                                  fillColor: AppTheme.background,
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.border)),
                                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppTheme.border)),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                      const Text('Cor principal', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.mutedForeground)),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Color(0xFFB8614A), const Color(0xFF9B7EA8), const Color(0xFF5B8DB8),
                          const Color(0xFF7DC198), const Color(0xFFE87B4A), const Color(0xFF3D3D3D)
                        ].map((c) => Container(
                          margin: const EdgeInsets.only(right: 8),
                          width: 32, height: 32,
                          decoration: BoxDecoration(color: c, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 4)]),
                        )).toList(),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Expanded(child: AppButton(label: 'Copiar link', variant: AppButtonVariant.outline, onPressed: () {})),
                          const SizedBox(width: 8),
                          Expanded(child: AppButton(label: 'Compartilhar', variant: AppButtonVariant.outline, onPressed: () {})),
                          const SizedBox(width: 8),
                          Expanded(child: AppButton(label: 'Publicar', onPressed: () {})),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 24),
              Expanded(
                child: Column(
                  children: [
                    Container(
                      decoration: BoxDecoration(border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(8)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => setState(() => tab = 'desktop'),
                            child: Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), decoration: BoxDecoration(color: tab == 'desktop' ? AppTheme.primary : Colors.transparent, borderRadius: BorderRadius.circular(8)), child: Text('Desktop', style: TextStyle(color: tab == 'desktop' ? Colors.white : AppTheme.mutedForeground))),
                          ),
                          InkWell(
                            onTap: () => setState(() => tab = 'mobile'),
                            child: Container(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), decoration: BoxDecoration(color: tab == 'mobile' ? AppTheme.primary : Colors.transparent, borderRadius: BorderRadius.circular(8)), child: Text('Mobile', style: TextStyle(color: tab == 'mobile' ? Colors.white : AppTheme.mutedForeground))),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      width: tab == 'mobile' ? 300 : double.infinity,
                      height: 500,
                      decoration: BoxDecoration(color: AppTheme.background, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(24)),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(24),
                            width: double.infinity,
                            color: AppTheme.primary,
                            child: Column(
                              children: [
                                const Text('Salão Rosé', style: TextStyle(fontFamily: 'Fraunces', fontSize: 24, color: Colors.white)),
                                Text('Moema · 4,9 ★', style: TextStyle(color: Colors.white.withValues(alpha: 0.8))),
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                                  child: const Text('Agendar horário', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Container(
                              color: AppTheme.muted.withValues(alpha: 0.3),
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                children: ['Cabelo', 'Unhas', 'Massagem'].map((s) => Container(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(s, style: const TextStyle(fontWeight: FontWeight.w500)),
                                      const Icon(LucideIcons.arrowRight, size: 16, color: AppTheme.primary),
                                    ],
                                  ),
                                )).toList(),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
