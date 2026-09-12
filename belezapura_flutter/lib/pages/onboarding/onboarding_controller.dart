import 'package:flutter/material.dart';

class ServiceItem {
  String name;
  String cat;
  String duration;
  String price;
  bool active;

  ServiceItem({required this.name, required this.cat, required this.duration, required this.price, this.active = true});
}

class ProfessionalItem {
  String name;
  String specialty;
  bool active;

  ProfessionalItem({required this.name, required this.specialty, this.active = true});
}

class ScheduleDay {
  String day;
  bool open;
  String start;
  String end;

  ScheduleDay({required this.day, this.open = true, this.start = "09:00", this.end = "19:00"});
}

class OnboardingController extends ChangeNotifier {
  int step = 1;
  bool done = false;

  String salonName = "Meu Salão";
  String pixKey = "";
  String pixType = "cpf";

  List<ServiceItem> services = [
    ServiceItem(name: "Manicure", cat: "Unhas", duration: "45 min", price: "R\$ 50"),
    ServiceItem(name: "Escova", cat: "Cabelo", duration: "60 min", price: "R\$ 80"),
    ServiceItem(name: "Massagem Relaxante", cat: "Massagem", duration: "60 min", price: "R\$ 120", active: false),
  ];

  List<ProfessionalItem> pros = [
    ProfessionalItem(name: "Ana Carvalho", specialty: "Cabelos"),
    ProfessionalItem(name: "Mariana Souza", specialty: "Unhas"),
  ];

  List<ScheduleDay> schedule = [
    ScheduleDay(day: "Segunda"),
    ScheduleDay(day: "Terça"),
    ScheduleDay(day: "Quarta"),
    ScheduleDay(day: "Quinta"),
    ScheduleDay(day: "Sexta"),
    ScheduleDay(day: "Sábado", end: "17:00"),
    ScheduleDay(day: "Domingo", open: false, start: "—", end: "—"),
  ];

  void next() {
    if (step < 7) {
      step++;
    } else {
      done = true;
    }
    notifyListeners();
  }

  void back() {
    if (step > 1) {
      step--;
      notifyListeners();
    }
  }

  void updateSalonName(String name) {
    salonName = name;
    notifyListeners();
  }

  void toggleService(int index) {
    services[index].active = !services[index].active;
    notifyListeners();
  }

  void removeService(int index) {
    services.removeAt(index);
    notifyListeners();
  }

  void removePro(int index) {
    pros.removeAt(index);
    notifyListeners();
  }

  void toggleSchedule(int index) {
    schedule[index].open = !schedule[index].open;
    notifyListeners();
  }

  void setPixType(String type) {
    pixType = type;
    notifyListeners();
  }

  void setPixKey(String key) {
    pixKey = key;
    notifyListeners();
  }
}
