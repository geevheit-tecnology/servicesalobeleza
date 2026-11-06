import 'package:belezapura_flutter/app/connected_app.dart';
import 'package:belezapura_flutter/app/public_pages.dart';
import 'package:belezapura_flutter/core/api_client.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

const ownerEmail = String.fromEnvironment('E2E_OWNER_EMAIL');
const otherEmail = String.fromEnvironment('E2E_OTHER_EMAIL');
const password = String.fromEnvironment('E2E_PASSWORD');
const slug = String.fromEnvironment('E2E_SLUG');
const bookingDate = String.fromEnvironment('E2E_DATE');

Future<void> waitFor(WidgetTester tester, Finder finder) async {
  for (var i = 0; i < 100 && finder.evaluate().isEmpty; i++) {
    await tester.pump(const Duration(milliseconds: 250));
  }
  expect(finder, findsWidgets);
  await tester.pumpAndSettle();
}

Future<void> login(WidgetTester tester, String email) async {
  await tester.enterText(find.widgetWithText(TextField, 'E-mail'), email);
  await tester.enterText(find.widgetWithText(TextField, 'Senha'), password);
  await tester.tap(find.text('Entrar'));
  await waitFor(tester, find.text('Agendamentos hoje'));
}

Future<void> openStock(WidgetTester tester) async {
  await tester.tap(find.byType(DrawerButton));
  await tester.pumpAndSettle();
  await tester.tap(find.text('Estoque'));
  await waitFor(tester, find.text('Adicionar produto'));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  setUpAll(() {
    final uri = Uri.parse(ApiClient.configuredUrl);
    expect(
      ['10.0.2.2', '127.0.0.1', 'localhost'],
      contains(uri.host),
      reason: 'Integração permitida somente contra a API local sintética.',
    );
    expect(ownerEmail.endsWith('@example.test'), isTrue);
    expect(otherEmail.endsWith('@example.test'), isTrue);
    expect(password, isNotEmpty);
  });

  testWidgets(
    'login, estoque persistido e isolamento em duas contas reais de teste',
    (tester) async {
      final api = ApiClient();
      addTearDown(api.close);
      await tester.pumpWidget(BelezaPuraApp(api: api));
      await login(tester, ownerEmail);
      await openStock(tester);
      await tester.tap(find.text('Adicionar produto'));
      await tester.pumpAndSettle();
      final productName =
          'Produto Flutter ${DateTime.now().microsecondsSinceEpoch}';
      for (final field in {
        'Nome': productName,
        'Categoria': 'Teste',
        'Quantidade': '8',
        'Mínimo': '2',
        'Preço': '29,90',
      }.entries) {
        final input = find.widgetWithText(TextFormField, field.key);
        await tester.ensureVisible(input);
        await tester.enterText(input, field.value);
      }
      await tester.ensureVisible(find.text('Salvar'));
      await tester.tap(find.text('Salvar'));
      await waitFor(tester, find.text(productName));
      final secondSession = ApiClient();
      addTearDown(secondSession.close);
      await secondSession.login(ownerEmail, password);
      final persisted =
          await secondSession.request('GET', '/salon/products') as List;
      expect(persisted.any((row) => row['nome'] == productName), isTrue);
      await tester.tap(find.byTooltip('Sair'));
      await tester.pumpAndSettle();
      await login(tester, otherEmail);
      await openStock(tester);
      await waitFor(tester, find.text('Nenhum registro cadastrado.'));
      expect(find.text(productName), findsNothing);
      expect(tester.takeException(), isNull);
    },
  );

  testWidgets('reserva pública na API real permanece aguardando conferência', (
    tester,
  ) async {
    final api = ApiClient();
    addTearDown(api.close);
    await tester.pumpWidget(
      MaterialApp(
        home: PublicBookingPage(api: api, slug: slug),
      ),
    );
    await waitFor(tester, find.byType(DropdownButtonFormField<String>));
    await tester.tap(find.byType(DropdownButtonFormField<String>).at(0));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Corte').last);
    await tester.pumpAndSettle();
    await tester.tap(find.byType(DropdownButtonFormField<String>).at(1));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Profissional').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Escolher data'));
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Switch to input'));
    await tester.pumpAndSettle();
    final date = DateTime.parse(bookingDate);
    await tester.enterText(
      find.byType(TextField).last,
      '${date.month}/${date.day}/${date.year}',
    );
    await tester.tap(find.text('OK'));
    await waitFor(tester, find.text('10:00'));
    await tester.tap(find.text('10:00'));
    await tester.enterText(
      find.widgetWithText(TextField, 'Seu nome'),
      'Cliente Flutter',
    );
    await tester.enterText(
      find.widgetWithText(TextField, 'Telefone com DDD'),
      '11977776666',
    );
    await tester.ensureVisible(find.text('Registrar reserva'));
    await tester.tap(find.text('Registrar reserva'));
    await waitFor(tester, find.text('Reserva registrada'));
    expect(
      find.textContaining('não confirma o recebimento do Pix'),
      findsOneWidget,
    );
    expect(find.text('Pago'), findsNothing);
    await api.login(ownerEmail, password);
    final appointments = await api.request('GET', '/appointments') as List;
    expect(
      appointments.any(
        (row) =>
            row['client']?['name'] == 'Cliente Flutter' &&
            row['status'] == 'waiting',
      ),
      isTrue,
    );
    expect(tester.takeException(), isNull);
  });
}
