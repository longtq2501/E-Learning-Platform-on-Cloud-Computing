import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from './LoginPage'
import { useAuth } from '../auth'

export function RegisterPage() {
  const { register } = useAuth(); const navigate = useNavigate(); const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('')
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); try { await register(fullName, email, password); navigate('/student') } catch { setError('Không thể tạo tài khoản. Vui lòng kiểm tra thông tin.') } }
  return <AuthForm title="Bắt đầu học thôi" subtitle="Tạo tài khoản Student miễn phí." onSubmit={submit} error={error}><label>Họ và tên<input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} /></label><button className="button button-primary" type="submit">Tạo tài khoản</button><p className="form-note">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></AuthForm>
}