import 'package:flutter/material.dart';
import 'app/connected_app.dart';

void main() {
  runApp(const BelezaPuraApp());
}

// Retained name for older embedders; both entrypoints use authenticated API flows.
class GeevheitHairApp extends StatelessWidget {
  const GeevheitHairApp({super.key});
  @override
  Widget build(BuildContext context) => const BelezaPuraApp();
}
