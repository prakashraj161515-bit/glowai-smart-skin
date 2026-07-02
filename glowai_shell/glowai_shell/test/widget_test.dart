import 'package:flutter_test/flutter_test.dart';

import 'package:glowai_shell/main.dart';

void main() {
  testWidgets('shell builds', (WidgetTester tester) async {
    await tester.pumpWidget(const CreamShellApp());
    expect(find.byType(CreamShellApp), findsOneWidget);
  });
}
