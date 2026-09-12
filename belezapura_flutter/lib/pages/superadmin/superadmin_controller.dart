import 'package:flutter/material.dart';

enum AdminTab {
  overview,
  saloes,
  unidades,
  assinaturas,
  planos,
  pagamentos,
  usuarios,
  suporte,
  configuracoes
}

class SuperadminController extends ChangeNotifier {
  AdminTab currentTab = AdminTab.overview;

  void setTab(AdminTab tab) {
    if (currentTab != tab) {
      currentTab = tab;
      notifyListeners();
    }
  }
}
