import 'package:flutter/material.dart';

enum SalonTab {
  dashboard,
  agenda,
  agendamentos,
  clientes,
  servicos,
  profissionais,
  horarios,
  financeiro,
  comissoes,
  pagina,
  avaliacoes,
  relatorios,
  configuracoes
}

class SalonController extends ChangeNotifier {
  SalonTab currentTab = SalonTab.dashboard;

  void setTab(SalonTab tab) {
    if (currentTab != tab) {
      currentTab = tab;
      notifyListeners();
    }
  }
}
