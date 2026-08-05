'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import Footer from '@/components/Footer';
import SimpleCaptcha from '@/components/SimpleCaptcha';
import { cardShell, cardBody, inputModern, labelModern, btnPrimaryClass, linkAccent } from '@/lib/page-theme';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaValid, setCaptchaValid] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Tên đăng nhập là bắt buộc';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        if (result.data?.token) localStorage.setItem('auth_token', result.data.token);
        localStorage.setItem('user_data', JSON.stringify(result.data || {}));
        window.location.href = '/dashboard';
      } else {
        alert(result.message || 'Đăng nhập thất bại.');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="we-page">
      <SubPageLayout breadcrumbs={[{ label: 'Đăng Nhập' }]} title="Đăng Nhập">
        <div className={cardShell}>
          <div className={cardBody}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="username" className={labelModern}>Tên đăng nhập *</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={inputModern}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                />
                {errors.username && <p style={{ color: 'var(--we-red)', fontSize: 12 }}>{errors.username}</p>}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label htmlFor="password" className={labelModern}>Mật khẩu *</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={inputModern}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                {errors.password && <p style={{ color: 'var(--we-red)', fontSize: 12 }}>{errors.password}</p>}
              </div>

              <SimpleCaptcha onVerify={setCaptchaValid} variant="minimal" />

              <button type="submit" disabled={!captchaValid} className={btnPrimaryClass} style={{ marginTop: 12 }}>
                {captchaValid ? 'Đăng nhập' : 'Vui lòng xác thực captcha'}
              </button>
            </form>

            <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#777' }}>
              Chưa có tài khoản? <Link href="/register" className={linkAccent}>Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </SubPageLayout>
      <Footer />
    </div>
  );
}
