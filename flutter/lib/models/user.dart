import 'package:examduler/models/role.dart';

class User {
  final String? id;
  final String email;
  final String domain;
  final String name;
  final List<String> exams;
	// TODO: put organizations in the future
  final Role role;

	User({
		this.id,
		required this.email,
		required this.domain,
		required this.name,
		required this.exams,
		required this.role,
	})
}
