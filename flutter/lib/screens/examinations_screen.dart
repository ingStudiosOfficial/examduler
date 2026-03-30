import 'package:examduler/models/exam.dart';
import 'package:flutter/material.dart';

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
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 0.8,
      ),
      itemCount: examinations.length,
      itemBuilder: (context, index) => _ExaminationCard(examinations[index]),
    );
  }
}

class _ExaminationCard extends Card {
  final Exam examDetails;

  const _ExaminationCard(this.examDetails);

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.primaryContainer,
      child: Padding(
        padding: EdgeInsets.all(10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[Text(examDetails.name)],
        ),
      ),
    );
  }
}
