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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(242, 108, 13, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(242, 108, 13, 0.05) 0%, transparent 40%)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        background: 'rgba(45, 31, 22, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: 'var(--primary)',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: 'white',
          boxShadow: '0 10px 20px var(--primary-glow)'
        }}>
          <LogIn size={32} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>OMS Admin</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }}>Chào mừng bạn quay lại hệ thống quản lý</p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          <Input
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập..."
            icon={User}
            {...register('username')}
            error={errors.username?.message}
          />
          <Input
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            {...register('password')}
            error={errors.password?.message}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>Quên mật khẩu?</a>
          </div>

          <Button
            type="submit"
            isLoading={isSubmitting}
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '1rem',
              fontSize: '1.1rem',
              fontWeight: '800',
              borderRadius: '9999px',
              backgroundColor: '#f26c0d',
              color: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(242, 108, 13, 0.4)'
            }}
          >
            ĐĂNG NHẬP
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
