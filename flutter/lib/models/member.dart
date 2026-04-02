import 'package:examduler/models/role.dart';
import 'package:examduler/models/user.dart';

class Member {
  final String? id;
  final String name;
  final String email;
  final Role role;

  Member({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory Member.fromUser(User user) {
    return Member(
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    );
  }
}
