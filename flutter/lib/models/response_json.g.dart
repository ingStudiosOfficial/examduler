// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'response_json.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ResponseJson _$ResponseJsonFromJson(Map<String, dynamic> json) => ResponseJson(
  message: json['message'] as String,
  exams: (json['exams'] as List<dynamic>?)
      ?.map((e) => Exam.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$ResponseJsonToJson(ResponseJson instance) =>
    <String, dynamic>{'message': instance.message, 'exams': instance.exams};
