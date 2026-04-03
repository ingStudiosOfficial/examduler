import 'dart:async';
import 'dart:io';

import 'package:examduler/models/user.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class UserService {
  final String _apiBaseUrl =
      dotenv.env['API_BASE_URL'] ?? 'https://examduler-api.ingstudios.dev';

  Future<User> fetchUser() async {
    final url = Uri.parse('$_apiBaseUrl/api/user/fetch/');

    try {
      final response = await http.get(url);

      final Map<String, dynamic> userMap = jsonDecode(response.body);

      final User userData = User.fromJson(userMap);

      return userData;
    } on SocketException {
      rethrow;
    } on TimeoutException {
      rethrow;
    } catch (e) {
      throw Exception('An unexpected error occurred while fetching user data');
    }
  }
}
