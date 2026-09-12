import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';
import 'package:belezapura_flutter/components/ui.dart';

class ServicosView extends StatefulWidget {
  const ServicosView({super.key});

  @override
  State<ServicosView> createState() => _ServicosViewState();
}

class _ServicosViewState extends State<ServicosView> {
  bool showForm = false;
  String filterCat = 'Todos';
  
  final cats = ['Todos', 'Cabelo', 'Unhas', 'Massagem', 'Estética', 'Sobrancelhas', 'Maquiagem'];
  
  final services = [
    {'name': 'Escova Progressiva', 'cat': 'Cabelo', 'dur': '120 min', 'price': 'R\$ 180', 'pro': 'Ana Carvalho', 'st': 'Ativo'},
    {'name': 'Manicure Gel', 'cat': 'Unhas', 'dur': '45 min', 'price': 'R\$ 65', 'pro': 'Mariana Souza', 'st': 'Ativo'},
    {'name': 'Corte Feminino', 'cat': 'Cabelo', 'dur': '60 min', 'price': 'R\$ 90', 'pro': 'Ana Carvalho', 'st': 'Ativo'},
    {'name': 'Massagem Relaxante', 'cat': 'Massagem', 'dur': '60 min', 'price': 'R\$ 130', 'pro': 'Juliana Costa', 'st': 'Ativo'},
    {'name': 'Pedicure', 'cat': 'Unhas', 'dur': '50 min', 'price': 'R\$ 60', 'pro': 'Mariana Souza', 'st': 'Inativo'},
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = filterCat == 'Todos' ? services : services.where((s) => s['cat'] == filterCat).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Serviços', style: TextStyle(fontFamily: 'Fraunces', fontSize: 32, fontWeight: FontWeight.w500)),
              AppButton(label: 'Novo serviço', icon: LucideIcons.plus, onPressed: () => setState(() => showForm = !showForm)),
            ],
          ),
          const SizedBox(height: 24),
          
          if (showForm) ...[
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppTheme.primary.withValues(alpha: 0.05), border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)), borderRadius: BorderRadius.circular(16)),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Novo serviço', style: TextStyle(fontWeight: FontWeight.w600)),
                      IconButton(icon: const Icon(LucideIcons.x, size: 16), onPressed: () => setState(() => showForm = false)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: TextField(decoration: InputDecoration(hintText: 'Nome do serviço', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), filled: true, fillColor: AppTheme.card, contentPadding: const EdgeInsets.symmetric(horizontal: 12)))),
                      const SizedBox(width: 12),
                      Expanded(child: TextField(decoration: InputDecoration(hintText: 'Categoria', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), filled: true, fillColor: AppTheme.card, contentPadding: const EdgeInsets.symmetric(horizontal: 12)))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: TextField(decoration: InputDecoration(hintText: 'Duração (min)', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), filled: true, fillColor: AppTheme.card, contentPadding: const EdgeInsets.symmetric(horizontal: 12)))),
                      const SizedBox(width: 12),
                      Expanded(child: TextField(decoration: InputDecoration(hintText: 'Preço (R\$)', border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), filled: true, fillColor: AppTheme.card, contentPadding: const EdgeInsets.symmetric(horizontal: 12)))),
                      const SizedBox(width: 12),
                      AppButton(label: 'Salvar', onPressed: () => setState(() => showForm = false)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],

          Wrap(
            spacing: 8, runSpacing: 8,
            children: cats.map((c) => InkWell(
              onTap: () => setState(() => filterCat = c),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(color: filterCat == c ? AppTheme.primary : AppTheme.secondary, borderRadius: BorderRadius.circular(20)),
                child: Text(c, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: filterCat == c ? Colors.white : AppTheme.mutedForeground)),
              ),
            )).toList(),
          ),
          const SizedBox(height: 16),

          Container(
            decoration: BoxDecoration(color: AppTheme.card, border: Border.all(color: AppTheme.border), borderRadius: BorderRadius.circular(16)),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(color: AppTheme.secondary, borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
                  child: const Row(
                    children: [
                      Expanded(flex: 2, child: Text('Serviço', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Categoria', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Duração', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Preço', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 2, child: Text('Profissionais', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text('Status', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppTheme.mutedForeground))),
                      SizedBox(width: 60),
                    ],
                  ),
                ),
                ...filtered.map((s) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppTheme.border))),
                  child: Row(
                    children: [
                      Expanded(flex: 2, child: Text(s['name']!, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14))),
                      Expanded(flex: 1, child: AppBadge(text: s['cat']!, variant: AppBadgeVariant.outline)),
                      Expanded(flex: 1, child: Text(s['dur']!, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: Text(s['price']!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppTheme.primary))),
                      Expanded(flex: 2, child: Text(s['pro']!, style: const TextStyle(fontSize: 14, color: AppTheme.mutedForeground))),
                      Expanded(flex: 1, child: AppBadge(text: s['st']!, variant: s['st'] == 'Ativo' ? AppBadgeVariant.success : AppBadgeVariant.outline)),
                      SizedBox(
                        width: 60,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(icon: const Icon(LucideIcons.edit3, size: 16), padding: EdgeInsets.zero, constraints: const BoxConstraints(), onPressed: () {}),
                            const SizedBox(width: 8),
                            IconButton(icon: const Icon(LucideIcons.trash2, size: 16), padding: EdgeInsets.zero, constraints: const BoxConstraints(), onPressed: () {}),
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
