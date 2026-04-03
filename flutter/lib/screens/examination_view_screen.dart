import 'package:examduler/models/exam.dart';
import 'package:examduler/models/seating.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:share_plus/share_plus.dart';

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
        actions: [
          IconButton(
            onPressed: _shareExam,
            icon: const Icon(Icons.share_outlined),
            tooltip: 'Share',
          ),
        ],
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

  void _shareExam() {
    final clientUrl =
        dotenv.env['API_BASE_URL'] ?? 'https://app.examduler.ingstudios.dev';

    final shareData = ShareParams(
      title: 'Examination ${examDetails.name} on Examduler',
      uri: Uri.parse('$clientUrl/exam?examId=${examDetails.id}'),
    );

    SharePlus.instance.share(shareData);
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
