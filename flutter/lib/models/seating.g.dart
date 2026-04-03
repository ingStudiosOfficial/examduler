// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seating.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Seating _$SeatingFromJson(Map<String, dynamic> json) => Seating(
  seat: json['seat'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
  isBlank: json['isBlank'] as bool?,
);

Map<String, dynamic> _$SeatingToJson(Seating instance) => <String, dynamic>{
  'seat': instance.seat,
  'name': instance.name,
  'email': instance.email,
  'isBlank': instance.isBlank,
};
