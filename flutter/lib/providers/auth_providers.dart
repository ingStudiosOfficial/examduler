import 'dart:async';

import 'package:examduler/services/auth_service.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthProviders extends AsyncNotifier<bool> {
  @override
  Future<bool> build() async {
    final service = ref.watch(authServiceProvider);
    return await service.checkAuth();
  }
}
