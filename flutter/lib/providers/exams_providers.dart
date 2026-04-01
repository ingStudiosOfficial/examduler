import 'package:examduler/models/exam.dart';
import 'package:examduler/models/seating.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ExamsNotifier extends Notifier<List<Exam>> {
  @override
  List<Exam> build() => [
    Exam(
      name: 'MY Exam',
      date: '2026-08-10T08:32:05Z',
      description: 'Pls prepare kids...',
      seating: [
        [
          Seating(
            seat: 'A1',
            name: 'Ethan Lee',
            email: 'contact@ingstudios.dev',
          ),
        ],
      ],
    ),
  ];
}

final examsProvider = NotifierProvider<ExamsNotifier, List<Exam>>(
  ExamsNotifier.new,
);
