import 'dart:async';

import 'package:examduler/services/auth_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthNotifier extends AsyncNotifier<bool> {
  @override
  Future<bool> build() async {
    final service = ref.watch(authServiceProvider);
    return await service.checkAuth();
  }

  Future<void> signInWithGoogle() async {
    final service = ref.read(authServiceProvider);

    state = const AsyncLoading();

    state = await AsyncValue.guard(() async {
      final token = await service.signInWithGoogle();

      if (token != null) {
        final storage = FlutterSecureStorage();
        await storage.write(key: 'auth_token', value: token);
        return true;
      }

      return false;
    });
  }

  Future<String?> getToken() async {
    return ref.read(authServiceProvider).getToken();
  }
}

final authNotifierProvider = AsyncNotifierProvider<AuthNotifier, bool>(() {
  return AuthNotifier();
});
