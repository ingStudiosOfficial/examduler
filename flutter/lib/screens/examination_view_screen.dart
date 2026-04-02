import 'package:examduler/models/exam.dart';
import 'package:examduler/models/seating.dart';
import 'package:flutter/material.dart';

class ExaminationViewScreen extends StatelessWidget {
  final Exam examDetails;

  const ExaminationViewScreen({super.key, required this.examDetails});

  @override
  Widget build(BuildContext context) {
    final Seating? userSeat = examDetails.getUserSeat('contact@ingstudios.dev');

    return Scaffold(
      appBar: AppBar(
        title: Text('Examination ${examDetails.name}'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        surfaceTintColor: Theme.of(context).colorScheme.surfaceContainer,
        titleSpacing: 0,
      ),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 10,
          children: <Widget>[
            _ExaminationDetailsWidget(
              detail: examDetails.getFormattedDate(),
              icon: Icons.event_outlined,
            ),
            _ExaminationDetailsWidget(
              detail: examDetails.description,
              icon: Icons.description_outlined,
            ),
            if (userSeat != null)
              _ExaminationDetailsWidget(
                detail: 'Seat ${userSeat.seat}',
                icon: Icons.info_outline,
              ),
          ],
        ),
      ),
      backgroundColor: Theme.of(context).colorScheme.surface,
    );
  }
}

class _ExaminationDetailsWidget extends StatelessWidget {
  final String detail;
  final IconData icon;

  const _ExaminationDetailsWidget({required this.detail, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      spacing: 10,
      children: [
        Icon(icon),
        Text(
          detail,
          textAlign: TextAlign.start,
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurface,
            fontSize: 17,
          ),
        ),
      ],
    );
  }
}
