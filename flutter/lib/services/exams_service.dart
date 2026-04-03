import 'dart:convert';

import 'package:examduler/models/exam.dart';
import 'package:examduler/models/response_json.dart';
import 'package:examduler/providers/auth_providers.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

class ExamsService {
  final Ref ref;
  final String _apiBaseUrl =
      dotenv.env['API_BASE_URL'] ?? 'https://examduler-api.ingstudios.dev';

  ExamsService({required this.ref});

  Future<List<Exam>> fetchAllExams() async {
    try {
      final authToken = ref.read(authNotifierProvider.notifier).getToken();

      final Uri url = Uri.parse('$_apiBaseUrl/api/exams/fetch/user/');

      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $authToken',
          'Content-Type': 'application/json',
        },
      );

      final Map<String, dynamic> examsMap = jsonDecode(response.body);

      final ResponseJson responseJson = ResponseJson.fromJson(examsMap);

      final List<Exam>? exams = responseJson.exams;

      if (exams == null || exams.isEmpty) {
        return [];
      }

      return exams;
    } catch (e) {
      rethrow;
    }
  }
}

final examsServiceProvider = Provider<ExamsService>((ref) {
  return ExamsService(ref: ref);
});
