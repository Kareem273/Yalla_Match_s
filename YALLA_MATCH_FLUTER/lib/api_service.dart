import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiService {
  static String? _adminToken;
  static const _customerSessionHeader = 'X-Customer-Session';
  static const Duration _defaultTimeout = Duration(seconds: 12);

  // In-memory cache for courts with TTL and in-flight deduplication
  static final Map<String, _CachedCourts> _courtsCache = {};
  static final Map<String, Future<List<dynamic>>> _inFlightCourts = {};

  static void clearCourtsCache() {
    _courtsCache.clear();
    _inFlightCourts.clear();
  }

  static String get baseUrl {
    const fromEnv = String.fromEnvironment('API_BASE_URL', defaultValue: '');
    if (fromEnv.isNotEmpty) return fromEnv.trim();

    if (kIsWeb) {
      return 'http://localhost:5000/api';
    }

    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000/api';
    }

    return 'http://127.0.0.1:5000/api';
  }

  static Uri _uri(String path) {
    final normalizedBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$normalizedBase$normalizedPath');
  }

  static Map<String, String> get _jsonHeaders => {
        'Content-Type': 'application/json',
        if (_adminToken != null) 'Authorization': 'Bearer $_adminToken',
      };

  static String mediaUrl(String value) {
    final uri = Uri.tryParse(value);
    if (uri != null && uri.hasScheme) return value;

    final apiIndex = baseUrl.lastIndexOf('/api');
    final host = apiIndex >= 0 ? baseUrl.substring(0, apiIndex) : baseUrl;
    return '$host${value.startsWith('/') ? value : '/$value'}';
  }

  static String courtImageUrl(String courtId) {
    final normalizedBase = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    return '$normalizedBase/courts/$courtId/image';
  }

  static Future<List<dynamic>> getCourts({String? sportType, bool forceRefresh = false}) async {
    final cacheKey = (sportType ?? '').trim().toLowerCase();

    if (!forceRefresh) {
      final cached = _courtsCache[cacheKey];
      if (cached != null && !cached.isExpired) {
        return cached.data;
      }
      if (_inFlightCourts.containsKey(cacheKey)) {
        return await _inFlightCourts[cacheKey]!;
      }
    }

    final future = _fetchCourts(sportType, cacheKey);
    _inFlightCourts[cacheKey] = future;

    try {
      return await future;
    } finally {
      _inFlightCourts.remove(cacheKey);
    }
  }

  static Future<List<dynamic>> _fetchCourts(String? sportType, String cacheKey) async {
    try {
      final query = sportType == null || sportType.trim().isEmpty
          ? ''
          : '?sportType=${Uri.encodeQueryComponent(sportType.trim())}';
      final res = await http.get(_uri('/courts$query')).timeout(_defaultTimeout);
      if (res.statusCode != 200) return [];
      final decoded = jsonDecode(res.body);
      final list = decoded is List ? decoded : [];
      _courtsCache[cacheKey] = _CachedCourts(list, DateTime.now().add(const Duration(seconds: 45)));
      return list;
    } catch (_) {
      // Fallback to expired cache if available during offline/network glitch
      final stale = _courtsCache[cacheKey];
      if (stale != null) return stale.data;
      return [];
    }
  }

  static Map<String, String> _customerHeaders(String customerSessionId) => {
        _customerSessionHeader: customerSessionId,
      };

  static Future<List<dynamic>> getReservations({required String customerSessionId}) async {
    try {
      final res = await http.get(
        _uri('/reservations/mine'),
        headers: _customerHeaders(customerSessionId),
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) return [];
      final decoded = jsonDecode(res.body);
      return decoded is List ? decoded : [];
    } catch (_) {
      return [];
    }
  }

  static Future<List<dynamic>> getCourtSlots({
    required String courtId,
    required String date,
  }) async {
    try {
      final res = await http.get(_uri('/courts/$courtId/slots?date=$date')).timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) return [];
      final decoded = jsonDecode(res.body);
      return decoded is List ? decoded : [];
    } catch (_) {
      return [];
    }
  }

  static Future<Map<String, dynamic>> createReservation({
    required String courtId,
    required String customerSessionId,
    required String date,
    required int from,
    required int to,
    String? customerName,
    String? customerPhone,
  }) async {
    final res = await http
        .post(
          _uri('/reservations'),
          headers: {
            'Content-Type': 'application/json',
            ..._customerHeaders(customerSessionId),
          },
          body: jsonEncode({
            'courtId': courtId,
            'customerName': customerName,
            'customerPhone': customerPhone,
            'date': date,
            'fromHour': from,
            'toHour': to,
          }),
        )
        .timeout(const Duration(seconds: 15));
    if (res.statusCode != 201 && res.statusCode != 200) {
      String message;
      switch (res.statusCode) {
        case 401:
          message = 'Your session has expired. Return to the home screen and try again.';
          break;
        case 409:
          message = 'This time is no longer available. Please choose another hour.';
          break;
        case 429:
          message = 'Too many booking attempts. Please wait one minute and try again.';
          break;
        default:
          message = 'Could not create the reservation (code ${res.statusCode}).';
      }
      try {
        final decoded = jsonDecode(res.body);
        if (decoded is String && decoded.trim().isNotEmpty) {
          message = decoded;
        } else if (decoded is Map<String, dynamic>) {
          message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
        }
      } catch (_) {}
      throw Exception(message);
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> updateReservationCustomer({
    required String reservationId,
    required String customerSessionId,
    String? customerName,
    String? customerPhone,
  }) async {
    final res = await http.post(
      _uri('/reservations/$reservationId/customer'),
      headers: {
        'Content-Type': 'application/json',
        ..._customerHeaders(customerSessionId),
      },
      body: jsonEncode({
        'customerName': customerName,
        'customerPhone': customerPhone,
      }),
    );
    if (res.statusCode != 200 && res.statusCode != 201) {
      String message = 'Failed to save customer details';
      try {
        final decoded = jsonDecode(res.body);
        if (decoded is Map<String, dynamic>) {
          message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
        } else if (decoded is String && decoded.isNotEmpty) {
          message = decoded;
        }
      } catch (_) {}
      throw Exception(message);
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> uploadPaymentScreenshot({
    required String reservationId,
    required String customerSessionId,
    required String fileName,
    String? path,
    Uint8List? bytes,
  }) async {
    final uri = _uri('/reservations/$reservationId/payment-confirmation');
    if (bytes != null && bytes.isNotEmpty) {
      final request = http.MultipartRequest('POST', uri);
      request.headers.addAll(_customerHeaders(customerSessionId));
      request.files.add(http.MultipartFile.fromBytes('screenshot', bytes, filename: fileName.isNotEmpty ? fileName : 'payment-confirmation.png'));
      final streamed = await request.send();
      final res = await http.Response.fromStream(streamed);
      if (res.statusCode != 200 && res.statusCode != 201) {
        String message = 'Failed to upload screenshot';
        try {
          final decoded = jsonDecode(res.body);
          if (decoded is Map<String, dynamic>) {
            message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
          } else if (decoded is String && decoded.isNotEmpty) {
            message = decoded;
          }
        } catch (_) {}
        throw Exception(message);
      }
      return jsonDecode(res.body) as Map<String, dynamic>;
    }

    if (path != null && path.isNotEmpty) {
      final request = http.MultipartRequest('POST', uri);
      request.headers.addAll(_customerHeaders(customerSessionId));
      request.files.add(await http.MultipartFile.fromPath('screenshot', path, filename: fileName.isNotEmpty ? fileName : 'payment-confirmation.png'));
      final streamed = await request.send();
      final res = await http.Response.fromStream(streamed);
      if (res.statusCode != 200 && res.statusCode != 201) {
        String message = 'Failed to upload screenshot';
        try {
          final decoded = jsonDecode(res.body);
          if (decoded is Map<String, dynamic>) {
            message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
          } else if (decoded is String && decoded.isNotEmpty) {
            message = decoded;
          }
        } catch (_) {}
        throw Exception(message);
      }
      return jsonDecode(res.body) as Map<String, dynamic>;
    }

    throw Exception('No screenshot selected');
  }

  static Future<Map<String, dynamic>> adminLogin(String email, String password) async {
    try {
      final res = await http.post(
        _uri('/auth/admin/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email.trim(), 'password': password}),
      );

      if (res.statusCode != 200) {
        String message = 'Invalid admin credentials';
        try {
          final decoded = jsonDecode(res.body);
          if (decoded is Map<String, dynamic>) {
            message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
          } else if (decoded is String && decoded.isNotEmpty) {
            message = decoded;
          }
        } catch (_) {}
        throw Exception(message);
      }

      final data = jsonDecode(res.body) as Map<String, dynamic>;
      _adminToken = data['token']?.toString() ?? data['Token']?.toString();
      return data;
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Unable to connect to the server. Ensure the backend is running and the URL is correct.');
    }
  }

  static Future<Map<String, dynamic>> createCourt({
    required String name,
    required String place,
    required double price,
    required String locationUrl,
    required String paymentPhone,
    String sportType = 'Football',
    String? ownerId,
    String? imagePath,
    Uint8List? imageBytes,
    String? imageFileName,
  }) async {
    final hasImageFile = (imagePath != null && imagePath.isNotEmpty) || (imageBytes != null && imageBytes.isNotEmpty);
    if (hasImageFile) {
      final request = http.MultipartRequest('POST', _uri('/courts/image'));
      request.headers.addAll({
        if (_adminToken != null) 'Authorization': 'Bearer $_adminToken',
      });
      request.fields.addAll({
        'name': name,
        'place': place,
        'price': price.toString(),
        'locationUrl': locationUrl,
        'paymentPhone': paymentPhone,
        'sportType': sportType,
        if (ownerId?.isNotEmpty == true) 'ownerId': ownerId!,
      });

      final fallbackName = (imageFileName?.trim().isNotEmpty ?? false)
          ? imageFileName!.trim()
          : 'court-image.png';

      if (imageBytes != null && imageBytes.isNotEmpty) {
        request.files.add(http.MultipartFile.fromBytes('image', imageBytes, filename: fallbackName));
      } else if (imagePath != null && imagePath.isNotEmpty) {
        request.files.add(await http.MultipartFile.fromPath('image', imagePath, filename: fallbackName));
      } else {
        throw Exception('Please choose an image file');
      }

      final response = await http.Response.fromStream(await request.send());
      if (response.statusCode != 201 && response.statusCode != 200) {
        String message = 'Failed to create court (${response.statusCode})';
        try {
          final decoded = jsonDecode(response.body);
          if (decoded is Map<String, dynamic>) {
            message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
          } else if (decoded is String && decoded.isNotEmpty) {
            message = decoded;
          }
        } catch (_) {}
        throw Exception(message);
      }
      clearCourtsCache();
      return jsonDecode(response.body) as Map<String, dynamic>;
    }

    final res = await http.post(
      _uri('/courts'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'name': name,
        'place': place,
        'price': price,
        'locationUrl': locationUrl,
        'paymentPhone': paymentPhone,
        'sportType': sportType,
        'ownerId': ownerId?.isEmpty == true ? null : ownerId,
      }),
    );
    if (res.statusCode != 201 && res.statusCode != 200) {
      String message = 'Failed to create court';
      try {
        final decoded = jsonDecode(res.body);
        if (decoded is Map<String, dynamic>) {
          message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
        } else if (decoded is String && decoded.isNotEmpty) {
          message = decoded;
        }
      } catch (_) {}
      throw Exception(message);
    }
    clearCourtsCache();
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> approvePayment(String reservationId) async {
    final res = await http.post(_uri('/admin/reservations/$reservationId/approve-payment'), headers: _jsonHeaders);
    if (res.statusCode != 200) throw Exception('Failed to approve payment');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<void> rejectPayment(String reservationId, {String? reason}) async {
    final res = await http.post(
      _uri('/admin/reservations/$reservationId/reject-payment'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'reason': reason ?? 'Rejected by admin'}),
    );
    if (res.statusCode != 204 && res.statusCode != 200) {
      throw Exception('Failed to reject payment');
    }
  }

  static Future<Map<String, dynamic>> cancelReservation(String reservationId, {String? reason}) async {
    final res = await http.post(
      _uri('/admin/reservations/$reservationId/cancel'),
      headers: _jsonHeaders,
      body: jsonEncode({'reason': reason ?? 'Cancelled by admin because payment was not received.'}),
    );
    if (res.statusCode != 200) throw Exception('Failed to cancel reservation');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> validateQr(String qrToken) async {
    final res = await http.post(
      _uri('/admin/qr/validate'),
      headers: _jsonHeaders,
      body: jsonEncode({'qrToken': qrToken}),
    );
    if (res.statusCode != 200) throw Exception('QR code is invalid');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> checkIn(String qrToken) async {
    final res = await http.post(
      _uri('/admin/qr/check-in'),
      headers: _jsonHeaders,
      body: jsonEncode({'qrToken': qrToken}),
    );
    if (res.statusCode != 200) throw Exception('Failed to check in reservation');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> trackReservation(String trackingCode) async {
    final res = await http.get(_uri('/tracking/$trackingCode'));
    if (res.statusCode != 200) throw Exception('Tracking code not found');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> requestRefundByTrackingCode({
    required String trackingCode,
    String? reason,
  }) async {
    final res = await http.post(
      _uri('/tracking/$trackingCode/refund'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'reason': reason ?? 'Refunded before the booking start time.'}),
    );
    if (res.statusCode != 200 && res.statusCode != 201) {
      String message;
      final body = res.body.trim();
      switch (res.statusCode) {
        case 404:
          message = 'لا يوجد حجز بهذا رمز التتبع أو لا يمكن طلب الريفاند الآن.';
          break;
        case 409:
          message = 'لا يمكن تنفيذ الريفاند. قد يكون الحجز مدفوعًا أو تم طلبه مسبقًا.';
          break;
        case 400:
          message = 'طلب الريفاند غير صالح. تأكد من البيانات وحاول مرة أخرى.';
          break;
        default:
          message = 'فشل طلب الريفاند (رمز الحالة ${res.statusCode}).';
      }
      try {
        final decoded = jsonDecode(body);
        if (decoded is Map<String, dynamic>) {
          message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
        } else if (decoded is String && decoded.isNotEmpty) {
          message = decoded;
        }
      } catch (_) {
        if (body.isNotEmpty) {
          message = body;
        }
      }
      throw Exception(message);
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<Map<String, dynamic>> requestRefund({
    required String reservationId,
    String? reason,
  }) async {
    final res = await http.post(
      _uri('/admin/reservations/$reservationId/refund'),
      headers: _jsonHeaders,
      body: jsonEncode({'reason': reason ?? 'Refunded before the booking start time.'}),
    );
    if (res.statusCode != 200 && res.statusCode != 201) {
      String message = 'Failed to request refund';
      try {
        final decoded = jsonDecode(res.body);
        if (decoded is Map<String, dynamic>) {
          message = decoded['message']?.toString() ?? decoded['error']?.toString() ?? message;
        } else if (decoded is String && decoded.isNotEmpty) {
          message = decoded;
        }
      } catch (_) {}
      throw Exception(message);
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  static Future<void> blockCourtSlot({
    required String courtId,
    required String date,
    required int hour,
    String? reason,
  }) async {
    final res = await http.post(
      _uri('/admin/courts/$courtId/slots/block'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'date': date,
        'fromHour': hour,
        'toHour': hour,
        'reason': reason,
      }),
    );
    if (res.statusCode != 201 && res.statusCode != 200) throw Exception('Failed to block slot');
  }

  static Future<void> unblockCourtSlot({
    required String courtId,
    required String date,
    required int hour,
  }) async {
    final res = await http.delete(
      _uri('/admin/courts/$courtId/slots/block?date=$date&hour=$hour'),
      headers: _jsonHeaders,
    );
    if (res.statusCode != 204 && res.statusCode != 200) throw Exception('Failed to unblock slot');
  }

  static Future<Map<String, dynamic>> createOfflineReservation({
    required String courtId,
    required String date,
    required int hour,
    String? customerName,
    String? customerPhone,
  }) async {
    final res = await http.post(
      _uri('/admin/reservations/offline'),
      headers: _jsonHeaders,
      body: jsonEncode({
        'courtId': courtId,
        'date': date,
        'fromHour': hour,
        'toHour': hour,
        'customerName': customerName,
        'customerPhone': customerPhone,
      }),
    );
    if (res.statusCode != 201 && res.statusCode != 200) throw Exception('Failed to create offline reservation');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }
}

class _CachedCourts {
  final List<dynamic> data;
  final DateTime expiresAt;

  _CachedCourts(this.data, this.expiresAt);

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}
