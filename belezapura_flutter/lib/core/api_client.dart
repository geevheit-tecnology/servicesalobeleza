import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final int status;
  final String message;
  const ApiException(this.status, this.message);
  @override
  String toString() => message;
}

class ApiClient {
  static const configuredUrl = String.fromEnvironment('API_BASE_URL');
  final http.Client client;
  final String baseUrl;
  String? token;
  Map<String, dynamic>? user;
  VoidCallback? onUnauthorized;
  ApiClient({http.Client? client, String? baseUrl})
    : client = client ?? http.Client(),
      baseUrl = baseUrl ?? configuredUrl;
  bool get configured {
    final uri = Uri.tryParse(baseUrl);
    return uri != null &&
        uri.host.isNotEmpty &&
        (uri.scheme == 'https' || (!kReleaseMode && uri.scheme == 'http'));
  }

  Future<dynamic> request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? query,
  }) async {
    if (!configured) {
      throw const ApiException(
        503,
        'Configure API_BASE_URL com uma URL HTTPS para usar o aplicativo.',
      );
    }
    final uri = Uri.parse('$baseUrl/api$path').replace(queryParameters: query);
    final request = http.Request(method, uri)
      ..headers['Content-Type'] = 'application/json';
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    if (body != null) request.body = jsonEncode(body);
    try {
      final streamed = await client
          .send(request)
          .timeout(const Duration(seconds: 25));
      final response = await http.Response.fromStream(
        streamed,
      ).timeout(const Duration(seconds: 25));
      if (response.statusCode == 204) return null;
      final data = jsonDecode(response.body);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        if (response.statusCode == 401 && token != null) {
          clearSession();
          onUnauthorized?.call();
        }
        throw ApiException(
          response.statusCode,
          data is Map
              ? (data['error'] ?? data['message'] ?? 'Operação não concluída.')
                    .toString()
              : 'Operação não concluída.',
        );
      }
      return data;
    } on TimeoutException {
      throw const ApiException(
        503,
        'O servidor demorou para responder. Tente novamente.',
      );
    } on FormatException {
      throw const ApiException(503, 'Resposta inválida do servidor.');
    } on http.ClientException {
      throw const ApiException(503, 'Não foi possível conectar ao servidor.');
    }
  }

  Future<void> login(String email, String password) async {
    final data = await request(
      'POST',
      '/auth/login',
      body: {'email': email.trim().toLowerCase(), 'password': password},
    );
    token = data['token'] as String;
    user = Map<String, dynamic>.from(data['user'] as Map);
  }

  void acceptSession(Map<String, dynamic> data) {
    token = data['token'] as String;
    user = Map<String, dynamic>.from(data['user'] as Map);
  }

  void clearSession() {
    token = null;
    user = null;
  }

  void close() => client.close();
}
