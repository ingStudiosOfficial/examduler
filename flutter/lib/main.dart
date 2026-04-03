import 'package:examduler/providers/auth_providers.dart';
import 'package:examduler/screens/examinations_screen.dart';
import 'package:examduler/screens/login_screen.dart';
import 'package:examduler/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

final authNotifierProvider = AsyncNotifierProvider<AuthNotifier, bool>(() {
  return AuthNotifier();
});

Future<void> main() async {
  await dotenv.load(fileName: '.env');
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final materialTheme = MaterialTheme(GoogleFonts.googleSansFlexTextTheme());

    final authState = ref.watch(authNotifierProvider);

    return MaterialApp(
      title: 'Examduler',
      debugShowCheckedModeBanner: false,
      theme: materialTheme.light(),
      darkTheme: materialTheme.dark(),
      themeMode: ThemeMode.system,
      home: authState.when(
        data: (isAuthenticated) =>
            isAuthenticated ? const ExaminationsScreen() : const LoginScreen(),
        error: (err, stack) => LoginScreen(),
        loading: () => LoginScreen(),
      ),
    );
  }
}
