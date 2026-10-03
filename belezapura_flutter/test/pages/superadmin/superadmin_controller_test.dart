import 'package:flutter_test/flutter_test.dart';
import 'package:belezapura_flutter/pages/superadmin/superadmin_controller.dart';

void main() {
  group('SuperadminController Tests', () {
    late SuperadminController controller;

    setUp(() {
      controller = SuperadminController();
    });

    test('Initial tab should be AdminTab.overview', () {
      expect(controller.currentTab, AdminTab.overview);
    });

    test('setTab should change the currentTab', () {
      controller.setTab(AdminTab.planos);
      expect(controller.currentTab, AdminTab.planos);
    });

    test('setTab should notify listeners when tab changes', () {
      bool listenerCalled = false;
      controller.addListener(() {
        listenerCalled = true;
      });

      controller.setTab(AdminTab.saloes);

      expect(listenerCalled, isTrue);
      expect(controller.currentTab, AdminTab.saloes);
    });

    test('setTab should not notify listeners if tab is the same', () {
      bool listenerCalled = false;
      controller.addListener(() {
        listenerCalled = true;
      });

      // It is already overview, so setting it again should not trigger listener
      controller.setTab(AdminTab.overview);

      expect(listenerCalled, isFalse);
    });
  });
}
