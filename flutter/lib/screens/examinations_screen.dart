import 'package:examduler/models/exam.dart';
import 'package:flutter/material.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:timeago/timeago.dart' as timeago;

class ExaminationsScreen extends StatelessWidget {
  final List<Exam> examinations;

  const ExaminationsScreen({super.key, required this.examinations});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Examinations'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _buildExamsGrid(context),
      backgroundColor: Theme.of(context).colorScheme.surface,
    );
  }

  Widget _buildExamsGrid(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 768;

    return AlignedGridView.count(
      padding: EdgeInsets.all(10),
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
    return Card(
      color: Theme.of(context).colorScheme.primaryContainer,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
      child: InkWell(
        onTap: () => print('Exam clicked.'),
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
                _calculateTimeFromExam(),
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
                    examDetails.date,
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

  String _calculateTimeFromExam() {
    final DateTime examDate = DateTime.parse(examDetails.date);
    final String formatted = timeago.format(examDate, allowFromNow: true);
    return formatted;
  }

  String _formatExamDate() {}
}
