import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:belezapura_flutter/core/api_client.dart';
import 'package:belezapura_flutter/app/connected_app.dart';
import 'package:belezapura_flutter/app/public_pages.dart';
void main(){
 testWidgets('entrada não apresenta dados administrativos sem login',(tester)async{
  final api=ApiClient(baseUrl:'https://api.example.test',client:MockClient((_)async=>http.Response('{}',200)));
  await tester.pumpWidget(BelezaPuraApp(api:api));expect(find.text('Entrar'),findsOneWidget);expect(find.text('Salão Rosé'),findsNothing);expect(find.text('Assinaturas'),findsNothing);api.close();
 });
 testWidgets('reserva pública só apresenta sucesso depois de resposta aceita e mantém pagamento pendente',(tester)async{
  tester.view.physicalSize=const Size(1080,2400);tester.view.devicePixelRatio=1;addTearDown(tester.view.resetPhysicalSize);addTearDown(tester.view.resetDevicePixelRatio);
  final api=ApiClient(baseUrl:'https://api.example.test',client:MockClient((request)async{
   if(request.url.path.contains('/salons/'))return http.Response(jsonEncode({'id':'salon','name':'Salão Real','timezone':'America/Sao_Paulo','services':[{'id':'service','name':'Corte'}],'professionals':[{'id':'pro','name':'Profissional'}]}),200);
   if(request.url.path.endsWith('/availability'))return http.Response('{"slots":{"10:00":"2030-01-01T10:00:00-03:00"}}',200);
   if(request.url.path.endsWith('/appointments'))return http.Response('{"error":"Horário reservado por outro cliente"}',409);
   return http.Response('{}',404);
  }));
  await tester.pumpWidget(MaterialApp(home:PublicBookingPage(api:api,slug:'real')));await tester.pumpAndSettle();expect(find.text('Salão Real'),findsOneWidget);expect(find.text('Reserva registrada'),findsNothing);expect(find.text('Pago'),findsNothing);api.close();
 });
 testWidgets('erro de autenticação fica visível sem navegar ao painel',(tester)async{
  final api=ApiClient(baseUrl:'https://api.example.test',client:MockClient((_)async=>http.Response('{"error":"Credenciais inválidas."}',401)));
  await tester.pumpWidget(BelezaPuraApp(api:api));await tester.enterText(find.widgetWithText(TextField,'E-mail'),'owner@example.test');await tester.enterText(find.widgetWithText(TextField,'Senha'),'wrong-password');await tester.tap(find.text('Entrar'));await tester.pumpAndSettle();expect(find.text('Credenciais inválidas.'),findsOneWidget);expect(find.text('Entrar'),findsOneWidget);api.close();
 });
}
