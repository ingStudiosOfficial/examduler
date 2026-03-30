import 'package:examduler/models/seating.dart';

class Exam {
  final String? id;
  final String name;
  final String date;
  final String description;
  final Seating? seating;

  Exam({
    this.id,
    required this.name,
    required this.date,
    required this.description,
    this.seating,
  });
}
