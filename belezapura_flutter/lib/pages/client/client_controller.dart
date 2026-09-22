import 'package:flutter/flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

enum BookingStep { salon, service, professional, date, time, data, summary, pix, confirm }

class ServiceItem {
  final String id;
  final String name;
  final String category;
  final String desc;
  final String duration;
  final String price;
  final String img;

  ServiceItem(this.id, this.name, this.category, this.desc, this.duration, this.price, this.img);
}

class ProfessionalItem {
  final String id;
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

  String salonId = '';
  String salonName = 'Carregando...';

  List<ServiceItem> services = [];
  List<ProfessionalItem> professionals = [];

  ClientController() {
    _loadSalonData();
  }

  Future<void> _loadSalonData() async {
    try {
      final res = await http.get(Uri.parse('http://localhost:3050/api/public/salon/demo'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        salonId = data['id'];
        salonName = data['name'];
        
        final List srvs = data['services'];
        services = srvs.map((s) => ServiceItem(
          s['id'], s['name'], 'Geral', '', '${s['duration']} min', 'R\$ ${s['price']}', 
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=150&fit=crop&auto=format'
        )).toList();

        final List pros = data['professionals'];
        professionals = pros.map((p) => ProfessionalItem(
          p['id'], p['name'], p['specialty'] ?? '', 5.0, 
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format'
        )).toList();
        
        notifyListeners();
      }
    } catch (e) {
      print('Erro ao carregar dados do salão: \$e');
    }
  }

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

  Future<void> simulatePayment() async {
    paymentState = 'confirmed';
    notifyListeners();

    try {
      await http.post(
        Uri.parse('http://localhost:3050/api/public/appointments'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'salonId': salonId,
          'clientName': clientName.isEmpty ? 'Cliente Teste' : clientName,
          'clientPhone': clientPhone.isEmpty ? '(11) 99999-9999' : clientPhone,
          'serviceId': selectedService?.id,
          'professionalId': selectedPro?.id,
          'date': DateTime.now().add(const Duration(days: 1)).toIso8601String(),
        }),
      );
    } catch (e) {
      print('Erro ao criar agendamento: \$e');
    }

    Future.delayed(const Duration(milliseconds: 800), () {
      setStep(BookingStep.confirm);
    });
  }
}
