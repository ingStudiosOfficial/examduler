import 'package:examduler/models/seating.dart';
import 'package:collection/collection.dart';

class Exam {
  final String? id;
  final String name;
  final String date;
  final String description;
  final List<List<Seating>>? seating;

  Exam({
    this.id,
    required this.name,
    required this.date,
    required this.description,
    this.seating,
  });

  Seating? getUserSeat(String email) {
    return seating
        ?.expand((list) => list)
        .firstWhereOrNull((s) => s.email == email);
  }
}
