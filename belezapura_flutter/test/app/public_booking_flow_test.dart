import 'dart:convert';
import 'package:belezapura_flutter/app/public_pages.dart';
import 'package:belezapura_flutter/core/api_client.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  for (final accepted in [false, true]) {
    testWidgets(
      accepted
          ? 'reserva aceita mantém Pix pendente de conferência'
          : 'conflito de horário não apresenta sucesso nem Pix',
      (tester) async {
        tester.view.physicalSize = const Size(1080, 2400);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);
        Map<String, dynamic>? submitted;
        final api = ApiClient(
          baseUrl: 'https://api.example.test',
          client: MockClient((request) async {
            if (request.url.path.contains('/salons/')) {
              return http.Response(
                jsonEncode({
                  'id': 'salon',
                  'name': 'Salão de teste',
                  'timezone': 'America/Sao_Paulo',
                  'services': [
                    {'id': 'service', 'name': 'Corte'},
                  ],
                  'professionals': [
                    {'id': 'pro', 'name': 'Maria'},
                  ],
                }),
                200,
              );
            }
            if (request.url.path.endsWith('/availability')) {
              expect(request.url.queryParameters['serviceId'], 'service');
              expect(request.url.queryParameters['professionalId'], 'pro');
              return http.Response(
                jsonEncode({
                  'slots': {
                    '10:00':
                        '${request.url.queryParameters['date']}T10:00:00-03:00',
                  },
                }),
                200,
              );
            }
            if (request.url.path.endsWith('/appointments')) {
              submitted = jsonDecode(request.body) as Map<String, dynamic>;
              return accepted
                  ? http.Response(
                      jsonEncode({
                        'appointment': {'id': 'booking', 'status': 'waiting'},
                        'pixCode': 'synthetic-pix-payload',
                        'deposit': 20,
                        'paymentStatus': 'pending_manual_review',
                      }),
                      201,
                    )
                  : http.Response(
                      '{"error":"Horário reservado por outro cliente"}',
                      409,
                    );
            }
            throw StateError('Unexpected request: ${request.url}');
          }),
        );
        addTearDown(api.close);
        await tester.pumpWidget(
          MaterialApp(
            home: PublicBookingPage(api: api, slug: 'test'),
          ),
        );
        await tester.pumpAndSettle();
        await tester.tap(find.byType(DropdownButtonFormField<String>).at(0));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Corte').last);
        await tester.pumpAndSettle();
        await tester.tap(find.byType(DropdownButtonFormField<String>).at(1));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Maria').last);
        await tester.pumpAndSettle();
        await tester.tap(find.text('Escolher data'));
        await tester.pumpAndSettle();
        await tester.tap(find.text('${DateTime.now().day}').last);
        await tester.tap(find.text('OK'));
        await tester.pumpAndSettle();
        await tester.tap(find.text('10:00'));
        await tester.enterText(
          find.widgetWithText(TextField, 'Seu nome'),
          'Ana',
        );
        await tester.enterText(
          find.widgetWithText(TextField, 'Telefone com DDD'),
          '11988887777',
        );
        await tester.ensureVisible(find.text('Registrar reserva'));
        await tester.tap(find.text('Registrar reserva'));
        await tester.pumpAndSettle();
        expect(submitted, containsPair('serviceId', 'service'));
        expect(submitted, containsPair('professionalId', 'pro'));
        expect(submitted, containsPair('clientName', 'Ana'));
        expect(submitted!['date'], endsWith('T10:00:00-03:00'));
        expect(find.text('Pago'), findsNothing);
        if (accepted) {
          expect(find.text('Reserva registrada'), findsOneWidget);
          expect(
            find.textContaining('não confirma o recebimento do Pix'),
            findsOneWidget,
          );
          expect(find.text('Copiar Pix Copia e Cola'), findsOneWidget);
        } else {
          expect(
            find.text('Horário reservado por outro cliente'),
            findsOneWidget,
          );
          expect(find.text('Reserva registrada'), findsNothing);
          expect(find.text('Copiar Pix Copia e Cola'), findsNothing);
        }
        expect(tester.takeException(), isNull);
      },
    );
  }
}
