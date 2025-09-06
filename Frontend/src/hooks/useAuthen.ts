import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useAuthen() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('loginSuccess');
    if (token) {
      setUser(token);
    }
    if (name) {
      toast.success(`Đăng nhập thành công! Xin chào ${name}`);
      localStorage.removeItem('loginSuccess');
    }
  }, []);

  return { user };
}
