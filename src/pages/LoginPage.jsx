import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { User, Lock, LogIn } from 'lucide-react';
import authService from '../services/authService';

const loginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải chứa ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải chứa ít nhất 6 ký tự'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      // Gọi API đăng nhập thực tế của Backend
      const response = await authService.login(data.username, data.password);

      if (response.success) {
        toast.success('Đăng nhập hệ thống Admin thành công!');
        navigate('/');
      } else {
        toast.error(response.message || 'Đăng nhập thất bại.');
      }
    } catch (error) {
      console.error('API error on login:', error);
      const errMsg = error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      toast.error(errMsg);
    }
  };

  return (
    <div 
      className="login-page-wrapper"
      style={{
        '--bg-card': 'rgba(255, 255, 255, 0.04)',
        '--text-main': '#ffffff',
        '--text-muted': 'rgba(255, 255, 255, 0.45)',
        '--border-color': 'rgba(255, 255, 255, 0.08)',
        '--radius-lg': '12px',
        '--primary': '#f26c0d',
        '--primary-hover': '#ea580c',
        '--primary-glow': 'rgba(242, 108, 13, 0.3)',
      }}
    >
      {/* Background Grids and Blobs */}
      <div className="login-grid-overlay"></div>
      <div className="login-blob login-blob-1"></div>
      <div className="login-blob login-blob-2"></div>
      <div className="login-blob login-blob-3"></div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo Container */}
        <div className="login-logo-container">
          <LogIn size={32} style={{ strokeWidth: 2.25 }} />
        </div>

        <h1 className="glow-text-orange" style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.25rem', letterSpacing: '-0.02em', textAlign: 'center' }}>
          ShopModern
        </h1>
        <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center' }}>
          Hệ Thống Quản Trị
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.85rem', marginBottom: '2.25rem', fontWeight: '500', textAlign: 'center' }}>
          Chào mừng quay trở lại. Hãy đăng nhập tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          <Input
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập của bạn"
            icon={User}
            {...register('username')}
            error={errors.username?.message}
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            icon={Lock}
            {...register('password')}
            error={errors.password?.message}
          />

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.55)', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                style={{ 
                  accentColor: '#f26c0d', 
                  borderRadius: '4px', 
                  width: '15px', 
                  height: '15px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }} 
              />
              Ghi nhớ đăng nhập
            </label>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="login-btn"
            style={{
              width: '100%',
              marginTop: '1.25rem',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: '800',
              borderRadius: '12px',
              textTransform: 'uppercase'
            }}
          >
            Đăng nhập hệ thống
          </Button>
        </form>

        {/* Security Footer Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '2.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          color: 'rgba(255, 255, 255, 0.35)',
          fontSize: '0.72rem',
          fontWeight: '600',
          letterSpacing: '0.08em'
        }}>
          <span style={{ 
            display: 'inline-block', 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            backgroundColor: '#22c55e', 
            boxShadow: '0 0 10px #22c55e', 
            marginRight: '2px',
            animation: 'pulse 2s infinite'
          }}></span>
          BẢO MẬT SSL MÃ HÓA 256-BIT
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
