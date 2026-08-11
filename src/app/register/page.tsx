'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SubPageLayout from '@/components/SubPageLayout';
import SimpleCaptcha from '@/components/SimpleCaptcha';
import {
  cardShell,
  cardBody,
  inputModern,
  labelModern,
  btnPrimaryClass,
  linkAccent,
} from '@/lib/page-theme';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successUsername, setSuccessUsername] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.username) newErrors.username = 'Tên đăng nhập là bắt buộc';
    else if (formData.username.length < 3) newErrors.username = 'Tên đăng nhập ít nhất 3 ký tự';
    if (!formData.password) newErrors.password = 'Mật khẩu là bắt buộc';
    else if (formData.password.length < 6) newErrors.password = 'Mật khẩu ít nhất 6 ký tự';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (!formData.securityQuestion) newErrors.securityQuestion = 'Chọn câu hỏi bảo mật';
    if (!formData.securityAnswer) newErrors.securityAnswer = 'Câu trả lời là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const username = formData.username.trim();
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          characterName: username,
          email: '',
          phone: '',
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessUsername(username);
        setIsSuccess(true);
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          securityQuestion: '',
          securityAnswer: '',
        });
      } else {
        alert(result.message || 'Đăng ký thất bại.');
      }
    } catch {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="we-page">
      <SubPageLayout title="Đăng Ký Tài Khoản">
        <div className={cardShell}>
          <div className={cardBody}>
            {isSuccess ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-xl">
                    ✓
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">Đăng ký thành công</h2>
                  <p className="text-gray-400 text-sm">Tài khoản của bạn đã được tạo.</p>
                </div>
                <div className="rounded-xl border border-purple-500/20 bg-[#120818]/60 p-3 text-sm">
                  <span className="text-gray-500">Tên đăng nhập / nhân vật</span>
                  <p className="text-white font-medium">{successUsername}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="rounded-xl border border-purple-500/30 px-4 py-2.5 text-sm text-zinc-200 transition hover:bg-purple-950/40"
                  >
                    Đăng ký tài khoản khác
                  </button>
                  <Link href="/login" className={btnPrimaryClass}>
                    Đăng nhập ngay
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelModern}>Tên đăng nhập *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`${inputModern} ${errors.username ? 'border-red-500' : ''}`}
                    placeholder="Nhập tên đăng nhập"
                    autoComplete="off"
                  />
                  {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
                  <p className="text-xs mt-1" style={{ color: 'var(--ns-text-muted)' }}>
                    Tên nhân vật sẽ lấy theo tên đăng nhập.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelModern}>Mật khẩu *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${inputModern} ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Nhập mật khẩu"
                      autoComplete="new-password"
                    />
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className={labelModern}>Xác nhận mật khẩu *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${inputModern} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelModern}>Câu hỏi bảo mật *</label>
                    <select
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleInputChange}
                      className={`${inputModern} ${errors.securityQuestion ? 'border-red-500' : ''}`}
                    >
                      <option value="">Chọn câu hỏi bảo mật</option>
                      <option value="pet">Tên thú cưng đầu tiên của bạn?</option>
                      <option value="school">Tên trường tiểu học của bạn?</option>
                      <option value="city">Thành phố bạn sinh ra?</option>
                      <option value="food">Món ăn yêu thích của bạn?</option>
                    </select>
                    {errors.securityQuestion && (
                      <p className="text-red-400 text-xs mt-1">{errors.securityQuestion}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelModern}>Câu trả lời *</label>
                    <input
                      type="text"
                      name="securityAnswer"
                      value={formData.securityAnswer}
                      onChange={handleInputChange}
                      className={`${inputModern} ${errors.securityAnswer ? 'border-red-500' : ''}`}
                      placeholder="Nhập câu trả lời"
                      autoComplete="off"
                    />
                    {errors.securityAnswer && (
                      <p className="text-red-400 text-xs mt-1">{errors.securityAnswer}</p>
                    )}
                  </div>
                </div>

                <SimpleCaptcha onVerify={setCaptchaValid} variant="minimal" />

                <button
                  type="submit"
                  disabled={!captchaValid || isLoading}
                  className={btnPrimaryClass}
                >
                  {isLoading ? 'Đang xử lý...' : captchaValid ? 'Tạo tài khoản' : 'Vui lòng xác thực captcha'}
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-sm" style={{ color: 'var(--ns-text-muted)' }}>
              Đã có tài khoản?{' '}
              <Link href="/login" className={linkAccent}>
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </SubPageLayout>
    </div>
  );
}
