import 'package:examduler/models/role.dart';
import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  @JsonKey(name: '_id')
  final String? id;
  final String email;
  final String domain;
  final String name;
  final List<String> exams;
  final List<String> organizations;
  final Role role;

  User({
    this.id,
    required this.email,
    required this.domain,
    required this.name,
    required this.exams,
    required this.organizations,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  Map<String, dynamic> toJson() => _$UserToJson(this);
}
