import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';
import 'package:http/http.dart' as http;

class AuthService {
  final String _apiBaseUrl =
      dotenv.env['API_BASE_URL'] ?? 'https://examduler-api.ingstudios.dev';
  final String _callbackScheme = 'examduler';

  Future<String?> getToken() async {
    final storage = FlutterSecureStorage();
    final String? authToken = await storage.read(key: 'auth_token');
    return authToken;
  }

  Future<bool> checkAuth() async {
    final String? authToken = await getToken();

    if (authToken == null) return false;

    final Uri url = Uri.parse('$_apiBaseUrl/api/session/verify/');

    try {
      final response = await http.get(
        url,
        headers: {
          'Authorization': 'Bearer $authToken',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }

  Future<String?> signInWithGoogle() async {
    try {
      final String url = '$_apiBaseUrl/api/oauth2/google/flutter/';

      final result = await FlutterWebAuth2.authenticate(
        url: url,
        callbackUrlScheme: _callbackScheme,
      );

      final Uri uri = Uri.parse(result);
      final String? token = uri.queryParameters['token'];

      if (token == null) {
        throw Exception('Token not found');
      }

      return token;
    } catch (e) {
      rethrow;
    }
  }
}
