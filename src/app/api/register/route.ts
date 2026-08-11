import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/config/backend.config';
import { validateAccountId, validatePassword, validateCharacterName, detectSQLInjection, logSuspiciousActivity } from '@/lib/security';
import { getClientIP } from '@/lib/utils';
import { securityMiddleware } from '@/lib/security-middleware';

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);

    const securityCheck = await securityMiddleware(request, '/api/register');
    if (securityCheck && !securityCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: securityCheck.error || 'Request không hợp lệ',
      }, { status: securityCheck.statusCode || 400 });
    }

    const body = await request.json();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const characterName = String(body.characterName || username).trim() || username;
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const securityQuestion = String(body.securityQuestion || '').trim();
    const securityAnswer = String(body.securityAnswer || '').trim();

    if (!username || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      }, { status: 400 });
    }

    const usernameValidation = validateAccountId(username);
    if (!usernameValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/register', username, 'Invalid username format');
      return NextResponse.json({
        success: false,
        message: usernameValidation.error || 'Tên đăng nhập không hợp lệ',
      }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/register', '***', 'Invalid password format');
      return NextResponse.json({
        success: false,
        message: passwordValidation.error || 'Mật khẩu không hợp lệ',
      }, { status: 400 });
    }

    const characterNameValidation = validateCharacterName(characterName);
    if (!characterNameValidation.valid) {
      logSuspiciousActivity(clientIP, '/api/register', characterName, 'Invalid character name format');
      return NextResponse.json({
        success: false,
        message: characterNameValidation.error || 'Tên nhân vật không hợp lệ',
      }, { status: 400 });
    }

    const allInputs = [username, password, characterName, email, phone, securityQuestion, securityAnswer];
    if (allInputs.some((input) => input && detectSQLInjection(input))) {
      logSuspiciousActivity(clientIP, '/api/register', username, 'SQL Injection attempt detected');
      return NextResponse.json({
        success: false,
        message: 'Input chứa ký tự không hợp lệ',
      }, { status: 400 });
    }

    const backendResponse = await fetch(getBackendUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        characterName,
        email: email || `${username}@noreply.local`,
        phone: phone || '0000000000',
      }),
    });

    const backendData = await backendResponse.json();

    if (backendData.success) {
      return NextResponse.json({
        success: true,
        message: backendData.message,
        data: {
          username,
          characterName,
        },
      });
    }

    return NextResponse.json({
      success: false,
      message: backendData.message,
    }, { status: backendResponse.status });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Lỗi kết nối đến server. Vui lòng thử lại sau.',
    }, { status: 500 });
  }
}
