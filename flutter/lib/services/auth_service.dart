import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class AuthService {
  final String _apiBaseUrl =
      dotenv.env['API_BASE_URL'] ?? 'https://examduler-api.ingstudios.dev';

  Future<bool> checkAuth() async {
    final Uri url = Uri.parse('$_apiBaseUrl/session/verify/');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }
}
