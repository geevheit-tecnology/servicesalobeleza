import 'package:flutter/material.dart';

enum BookingStep { salon, service, professional, date, time, data, summary, pix, confirm }

class ServiceItem {
  final int id;
  final String name;
  final String category;
  final String desc;
  final String duration;
  final String price;
  final String img;

  ServiceItem(this.id, this.name, this.category, this.desc, this.duration, this.price, this.img);
}

class ProfessionalItem {
  final int id;
  final String name;
  final String specialty;
  final double rating;
  final String? img;

  ProfessionalItem(this.id, this.name, this.specialty, this.rating, [this.img]);
}

class ClientController extends ChangeNotifier {
  BookingStep step = BookingStep.salon;
  
  ServiceItem? selectedService;
  ProfessionalItem? selectedPro;
  int? selectedDate;
  String? selectedTime;
  String clientName = '';
  String clientPhone = '';
  bool reminder = true;
  bool copied = false;
  String paymentState = 'pending'; // 'pending', 'confirmed'

  final List<ServiceItem> services = [
    ServiceItem(1, "Escova Progressiva", "Cabelo", "Alinhamento com keratina", "120 min", "R\$ 180", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=150&fit=crop&auto=format"),
    ServiceItem(2, "Manicure", "Unhas", "Cutícula + esmaltação gel", "45 min", "R\$ 55", "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=200&h=150&fit=crop&auto=format"),
    ServiceItem(3, "Corte Feminino", "Cabelo", "Corte + finalização", "60 min", "R\$ 90", "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=150&fit=crop&auto=format"),
    ServiceItem(4, "Massagem Relaxante", "Massagem", "60 min corpo inteiro", "60 min", "R\$ 130", "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=150&fit=crop&auto=format"),
  ];

  final List<ProfessionalItem> professionals = [
    ProfessionalItem(0, "Qualquer disponível", "", 0),
    ProfessionalItem(1, "Ana Carvalho", "Especialista em Cabelos", 4.9, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format"),
    ProfessionalItem(2, "Mariana Souza", "Manicure & Pedicure", 4.8, "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&auto=format"),
  ];

  void setStep(BookingStep newStep) {
    step = newStep;
    notifyListeners();
  }

  void goBack() {
    switch (step) {
      case BookingStep.salon: break;
      case BookingStep.service: step = BookingStep.salon; break;
      case BookingStep.professional: step = BookingStep.service; break;
      case BookingStep.date: step = BookingStep.professional; break;
      case BookingStep.time: step = BookingStep.date; break;
      case BookingStep.data: step = BookingStep.time; break;
      case BookingStep.summary: step = BookingStep.data; break;
      case BookingStep.pix: step = BookingStep.summary; break;
      case BookingStep.confirm: step = BookingStep.pix; break;
    }
    notifyListeners();
  }

  void simulatePayment() {
    paymentState = 'confirmed';
    notifyListeners();
    Future.delayed(const Duration(milliseconds: 800), () {
      setStep(BookingStep.confirm);
    });
  }
}
