import 'package:examduler/models/exam.dart';
import 'package:examduler/models/seating.dart';
import 'package:examduler/providers/exams_providers.dart';
import 'package:examduler/screens/examination_view_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ExaminationsScreen extends ConsumerWidget {
  const ExaminationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final examinations = ref.watch(examsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('Examinations'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        surfaceTintColor: Theme.of(context).colorScheme.surfaceContainer,
        titleSpacing: 20,
      ),
      body: _buildExamsGrid(context, examinations),
      backgroundColor: Theme.of(context).colorScheme.surface,
    );
  }

  Widget _buildExamsGrid(BuildContext context, List<Exam> examinations) {
    final bool isMobile = MediaQuery.of(context).size.width < 768;

    return AlignedGridView.count(
      padding: EdgeInsets.all(20),
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isMobile ? 1 : 3,
      mainAxisSpacing: 10,
      crossAxisSpacing: 10,
      itemCount: examinations.length,
      itemBuilder: (context, index) => _ExaminationCard(examinations[index]),
    );
  }
}

class _ExaminationCard extends StatelessWidget {
  final Exam examDetails;

  const _ExaminationCard(this.examDetails);

  @override
  Widget build(BuildContext context) {
    final Seating? userSeat = examDetails.getUserSeat('contact@ingstudios.dev');

    return Card(
      color: Theme.of(context).colorScheme.primaryContainer,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
      child: InkWell(
        onTap: () => _openExamViewPage(context),
        borderRadius: BorderRadius.circular(25),
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            spacing: 10,
            children: <Widget>[
              Text(
                examDetails.name,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                  fontSize: 25,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              Text(
                _calculateTimeFromExam(examDetails.date),
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                spacing: 10,
                children: <Widget>[
                  Text(
                    examDetails.getFormattedDate(),
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (userSeat != null)
                    Text(
                      'Seat ${userSeat.seat}',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _calculateTimeFromExam(String unparsedDate) {
    final DateTime examDate = DateTime.parse(unparsedDate);
    final String formatted = timeago.format(examDate, allowFromNow: true);
    return formatted;
  }

  void _openExamViewPage(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ExaminationViewScreen(examDetails: examDetails),
      ),
    );
  }
}
