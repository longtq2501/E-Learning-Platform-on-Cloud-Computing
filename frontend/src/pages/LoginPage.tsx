import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); try { const user = await login(email, password); navigate(user.role === 'ADMIN' ? '/admin' : '/student') } catch { setError('Email hoặc mật khẩu chưa đúng.') } }
  return <AuthForm title="Chào mừng trở lại" subtitle="Tiếp tục hành trình học tập của bạn." onSubmit={submit} error={error}>
    <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} /></label>
    <button className="button button-primary" type="submit">Đăng nhập</button>
    <p className="form-note">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
  </AuthForm>
}

export function AuthForm({ title, subtitle, onSubmit, error, children }: { title: string; subtitle: string; onSubmit: (event: FormEvent) => void; error: string; children: React.ReactNode }) {
  return <main className="auth-layout"><section className="auth-intro"><span className="eyebrow">CLOUD CAMPUS / 04</span><h1>Học theo<br /><em>nhịp của bạn.</em></h1><p>Một thư viện số gọn gàng cho những ý tưởng lớn hơn.</p></section><form className="auth-card" onSubmit={onSubmit}><span className="eyebrow">STUDENT ACCESS</span><h2>{title}</h2><p className="muted">{subtitle}</p>{children}{error && <p className="error" role="alert">{error}</p>}</form></main>
}