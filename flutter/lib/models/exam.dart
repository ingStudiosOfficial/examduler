import 'package:examduler/models/seating.dart';
import 'package:collection/collection.dart';
import 'package:intl/intl.dart';
import 'package:json_annotation/json_annotation.dart';

part 'exam.g.dart';

@JsonSerializable()
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

  String getFormattedDate() {
    final DateTime examDate = DateTime.parse(date);
    final String formatted = DateFormat('d MMMM yyyy').format(examDate);
    return formatted;
  }

  factory Exam.fromJson(Map<String, dynamic> json) => _$ExamFromJson(json);
  Map<String, dynamic> toJson() => _$ExamToJson(this);
}
