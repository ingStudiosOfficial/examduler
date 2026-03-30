import 'package:examduler/models/exam.dart';
import 'package:examduler/screens/examinations_screen.dart';
import 'package:examduler/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    final examinations = <Exam>[
      Exam(
        name: 'Gay Exam',
        date: '21st May 2026',
        description: 'erik is gay...',
      ),
    ];

    final materialTheme = MaterialTheme(GoogleFonts.googleSansFlexTextTheme());

    return MaterialApp(
      title: 'Examduler',
      debugShowCheckedModeBanner: false,
      theme: materialTheme.light(),
      darkTheme: materialTheme.dark(),
      themeMode: ThemeMode.system,
      home: ExaminationsScreen(examinations: examinations),
    );
  }
}
