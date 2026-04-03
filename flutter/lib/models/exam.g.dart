// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'exam.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Exam _$ExamFromJson(Map<String, dynamic> json) => Exam(
  id: json['id'] as String?,
  name: json['name'] as String,
  date: json['date'] as String,
  description: json['description'] as String,
  seating: (json['seating'] as List<dynamic>?)
      ?.map(
        (e) => (e as List<dynamic>)
            .map((e) => Seating.fromJson(e as Map<String, dynamic>))
            .toList(),
      )
      .toList(),
);

Map<String, dynamic> _$ExamToJson(Exam instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'date': instance.date,
  'description': instance.description,
  'seating': instance.seating,
};
