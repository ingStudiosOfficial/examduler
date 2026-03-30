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
}
