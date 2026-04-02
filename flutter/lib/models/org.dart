import 'package:examduler/models/domain.dart';
import 'package:examduler/models/member.dart';

class Org {
  final String? id;
  final String name;
  final List<Domain> domains;
  final List<Member> members;

  Org({
    this.id,
    required this.name,
    required this.domains,
    required this.members,
  });
}
