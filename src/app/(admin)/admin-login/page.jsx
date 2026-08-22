// src/app/%28admin%29/admin-login/page.jsx
import { redirect } from 'next/navigation';

export default function AdminLoginRedirect() {
  redirect('/login');
}