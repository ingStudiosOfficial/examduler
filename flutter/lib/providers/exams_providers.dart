import 'dart:async';
import 'dart:io';

import 'package:examduler/models/exam.dart';
import 'package:examduler/services/exams_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ExamsNotifier extends AsyncNotifier<List<Exam>> {
  @override
  Future<List<Exam>> build() async {
    return _fetchFromService();
  }

  Future<List<Exam>> _fetchFromService() async {
    final service = ref.read(examsServiceProvider);
    return await service.fetchAllExams();
  }

  Future<void> refreshExams() async {
    final service = ref.read(examsServiceProvider);

    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      try {
        final fetchedExams = await service.fetchAllExams();
        return fetchedExams;
      } on SocketException {
        rethrow;
      } on TimeoutException {
        rethrow;
      } catch (e) {
        return [];
      }
    });
  }
}

final examsProvider = AsyncNotifierProvider<ExamsNotifier, List<Exam>>(
  ExamsNotifier.new,
);
