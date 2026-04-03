import 'package:examduler/models/exam.dart';
import 'package:json_annotation/json_annotation.dart';

part 'response_json.g.dart';

@JsonSerializable()
class ResponseJson {
  final String message;

  final List<Exam>? exams;

  ResponseJson({required this.message, this.exams});

  factory ResponseJson.fromJson(Map<String, dynamic> json) =>
      _$ResponseJsonFromJson(json);
  Map<String, dynamic> toJson() => _$ResponseJsonToJson(this);
}
