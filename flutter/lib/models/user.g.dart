// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: json['_id'] as String?,
  email: json['email'] as String,
  domain: json['domain'] as String,
  name: json['name'] as String,
  exams: (json['exams'] as List<dynamic>).map((e) => e as String).toList(),
  organizations: (json['organizations'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  role: $enumDecode(_$RoleEnumMap, json['role']),
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  '_id': instance.id,
  'email': instance.email,
  'domain': instance.domain,
  'name': instance.name,
  'exams': instance.exams,
  'organizations': instance.organizations,
  'role': _$RoleEnumMap[instance.role]!,
};

const _$RoleEnumMap = {
  Role.student: 'student',
  Role.teacher: 'teacher',
  Role.admin: 'admin',
};
