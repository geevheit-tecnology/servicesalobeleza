import 'package:flutter/material.dart';
import 'package:belezapura_flutter/theme/app_theme.dart';

enum AppButtonVariant { primary, secondary, ghost, outline, danger }
enum AppButtonSize { sm, md, lg }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final AppButtonSize size;
  final IconData? icon;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.size = AppButtonSize.md,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    EdgeInsets padding;
    double fontSize;
    double height;
    switch (size) {
      case AppButtonSize.sm:
        padding = const EdgeInsets.symmetric(horizontal: 12);
        fontSize = 14;
        height = 32;
        break;
      case AppButtonSize.lg:
        padding = const EdgeInsets.symmetric(horizontal: 24);
        fontSize = 16;
        height = 48;
        break;
      case AppButtonSize.md:
        padding = const EdgeInsets.symmetric(horizontal: 16);
        fontSize = 14;
        height = 40;
        break;
    }

    Widget child = Text(label, style: TextStyle(fontSize: fontSize, fontWeight: FontWeight.w500));
    if (icon != null) {
      child = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: fontSize + 2),
          const SizedBox(width: 8),
          child,
        ],
      );
    }

    ButtonStyle style;
    switch (variant) {
      case AppButtonVariant.secondary:
        style = ElevatedButton.styleFrom(
          backgroundColor: AppTheme.secondary,
          foregroundColor: AppTheme.secondaryForeground,
          elevation: 0,
          side: const BorderSide(color: AppTheme.border),
          padding: padding,
          minimumSize: Size(0, height),
        );
        return ElevatedButton(onPressed: onPressed, style: style, child: child);
      case AppButtonVariant.ghost:
        style = TextButton.styleFrom(
          foregroundColor: AppTheme.mutedForeground,
          padding: padding,
          minimumSize: Size(0, height),
        );
        return TextButton(onPressed: onPressed, style: style, child: child);
      case AppButtonVariant.outline:
        style = OutlinedButton.styleFrom(
          foregroundColor: AppTheme.foreground,
          side: const BorderSide(color: AppTheme.border),
          padding: padding,
          minimumSize: Size(0, height),
        );
        return OutlinedButton(onPressed: onPressed, style: style, child: child);
      case AppButtonVariant.danger:
        style = ElevatedButton.styleFrom(
          backgroundColor: Colors.red.shade50,
          foregroundColor: Colors.red.shade600,
          elevation: 0,
          side: BorderSide(color: Colors.red.shade200),
          padding: padding,
          minimumSize: Size(0, height),
        );
        return ElevatedButton(onPressed: onPressed, style: style, child: child);
      case AppButtonVariant.primary:
        style = ElevatedButton.styleFrom(
          padding: padding,
          minimumSize: Size(0, height),
        );
        return ElevatedButton(onPressed: onPressed, style: style, child: child);
    }
  }
}

enum AppBadgeVariant { defaultVariant, success, warning, danger, info, purple, outline }

class AppBadge extends StatelessWidget {
  final String text;
  final AppBadgeVariant variant;

  const AppBadge({super.key, required this.text, this.variant = AppBadgeVariant.defaultVariant});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color? border;

    switch (variant) {
      case AppBadgeVariant.success:
        bg = Colors.green.shade50;
        fg = Colors.green.shade700;
        border = Colors.green.shade200;
        break;
      case AppBadgeVariant.warning:
        bg = Colors.amber.shade50;
        fg = Colors.amber.shade700;
        border = Colors.amber.shade200;
        break;
      case AppBadgeVariant.danger:
        bg = Colors.red.shade50;
        fg = Colors.red.shade600;
        border = Colors.red.shade200;
        break;
      case AppBadgeVariant.info:
        bg = Colors.blue.shade50;
        fg = Colors.blue.shade700;
        border = Colors.blue.shade200;
        break;
      case AppBadgeVariant.purple:
        bg = Colors.purple.shade50;
        fg = Colors.purple.shade700;
        border = Colors.purple.shade200;
        break;
      case AppBadgeVariant.outline:
        bg = Colors.transparent;
        fg = AppTheme.mutedForeground;
        border = AppTheme.border;
        break;
      case AppBadgeVariant.defaultVariant:
        bg = AppTheme.muted;
        fg = AppTheme.mutedForeground;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: border != null ? Border.all(color: border) : null,
      ),
      child: Text(
        text,
        style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w500),
      ),
    );
  }
}

class AppAvatar extends StatelessWidget {
  final String name;
  final String? src;
  final double radius;

  const AppAvatar({super.key, required this.name, this.src, this.radius = 20});

  @override
  Widget build(BuildContext context) {
    if (src != null) {
      return CircleAvatar(
        radius: radius,
        backgroundImage: NetworkImage(src!),
      );
    }
    final initials = name.split(' ').take(2).map((e) => e.isNotEmpty ? e[0] : '').join('').toUpperCase();
    final colors = [
      Colors.pink.shade100, Colors.purple.shade100, Colors.orange.shade100,
      Colors.teal.shade100, Colors.blue.shade100
    ];
    final fgs = [
      Colors.pink.shade700, Colors.purple.shade700, Colors.orange.shade700,
      Colors.teal.shade700, Colors.blue.shade700
    ];
    final colorIdx = name.codeUnitAt(0) % colors.length;

    return CircleAvatar(
      radius: radius,
      backgroundColor: colors[colorIdx],
      child: Text(
        initials,
        style: TextStyle(
          color: fgs[colorIdx],
          fontSize: radius * 0.8,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class AppInput extends StatelessWidget {
  final String? label;
  final String? error;
  final String? hintText;
  final bool obscureText;
  final TextEditingController? controller;

  const AppInput({
    super.key,
    this.label,
    this.error,
    this.hintText,
    this.obscureText = false,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(label!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppTheme.foreground)),
          const SizedBox(height: 6),
        ],
        TextField(
          controller: controller,
          obscureText: obscureText,
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: const TextStyle(color: AppTheme.mutedForeground),
            filled: true,
            fillColor: AppTheme.card,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppTheme.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: error != null ? Colors.red.shade300 : AppTheme.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: error != null ? Colors.red.shade400 : AppTheme.primary, width: 2),
            ),
          ),
        ),
        if (error != null) ...[
          const SizedBox(height: 4),
          Text(error!, style: TextStyle(fontSize: 12, color: Colors.red.shade500)),
        ],
      ],
    );
  }
}

class AppCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets padding;

  const AppCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        hoverColor: AppTheme.primary.withValues(alpha: 0.05),
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}

class AppStars extends StatelessWidget {
  final double rating;
  final int? count;

  const AppStars({super.key, required this.rating, this.count});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Text('★', style: TextStyle(color: Colors.amber, fontSize: 16)),
        const SizedBox(width: 4),
        Text(rating.toStringAsFixed(1), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
        if (count != null) ...[
          const SizedBox(width: 4),
          Text('($count)', style: const TextStyle(fontSize: 12, color: AppTheme.mutedForeground)),
        ],
      ],
    );
  }
}
