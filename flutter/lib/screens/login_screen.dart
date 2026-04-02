import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Login'),
        backgroundColor: Theme.of(context).colorScheme.surface,
        surfaceTintColor: Theme.of(context).colorScheme.surfaceContainer,
        titleSpacing: 20,
      ),
      body: const Text('Login'),
      backgroundColor: Theme.of(context).colorScheme.surface,
    );
  }
}
