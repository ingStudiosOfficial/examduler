import 'package:json_annotation/json_annotation.dart';

part 'seating.g.dart';

@JsonSerializable()
class Seating {
  final String seat;
  final String name;
  final String email;
  final bool? isBlank;

  Seating({
    required this.seat,
    required this.name,
    required this.email,
    this.isBlank,
  });

  factory Seating.fromJson(Map<String, dynamic> json) =>
      _$SeatingFromJson(json);

  Map<String, dynamic> toJson() => _$SeatingToJson(this);
}
