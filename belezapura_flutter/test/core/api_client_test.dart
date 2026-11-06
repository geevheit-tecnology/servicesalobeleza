import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:belezapura_flutter/core/api_client.dart';
void main() {
 test('login usa API configurada e anexa token somente após autenticar', () async {
  final seen = <http.Request>[];
  final api = ApiClient(baseUrl: 'https://api.example.test', client: MockClient((request) async {
   seen.add(request);
   if (request.url.path.endsWith('/auth/login')) { expect(jsonDecode(request.body)['email'], 'owner@example.test'); return http.Response(jsonEncode({'token':'signed-token','user':{'id':'owner','role':'owner','name':'Responsável'}}),200); }
   expect(request.headers['Authorization'], 'Bearer signed-token'); return http.Response('[]',200);
  }));
  await api.login(' OWNER@example.test ', 'password'); await api.request('GET','/salon/products');
  expect(seen.first.headers['Authorization'], isNull); expect(seen.last.url.toString(), 'https://api.example.test/api/salon/products'); expect(api.user!['role'],'owner'); api.close();
 });
 test('sessão revogada é limpa quando API retorna 401', () async {
  var revoked = false;
  final api = ApiClient(baseUrl:'https://api.example.test',client:MockClient((_) async => http.Response('{"error":"Sessão expirada"}',401)));
  api.token='old-token'; api.user={'role':'owner'}; api.onUnauthorized=(){revoked=true;};
  await expectLater(api.request('GET','/salon/details'),throwsA(isA<ApiException>().having((e)=>e.status,'status',401)));
  expect(api.token,isNull); expect(api.user,isNull); expect(revoked,isTrue); api.close();
 });
 test('suspensão de assinatura preserva sessão para solicitar regularização', () async {
  final api=ApiClient(baseUrl:'https://api.example.test',client:MockClient((_)async=>http.Response('{"error":"Assinatura vencida"}',402)));api.token='valid-token';
  await expectLater(api.request('POST','/appointments',body:{}),throwsA(isA<ApiException>().having((e)=>e.status,'status',402)));expect(api.token,'valid-token');api.close();
 });
 test('ausência de configuração impede chamadas para localhost implícito', () async {
  var called=false;final api=ApiClient(baseUrl:'',client:MockClient((_)async{called=true;return http.Response('{}',200);}));await expectLater(api.request('GET','/public/plans'),throwsA(isA<ApiException>()));expect(called,isFalse);api.close();
 });
}
