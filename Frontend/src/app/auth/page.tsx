'use client';
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuthStore } from '@/stores/auth';

const AuthCallback = () => {
  const router = useRouter();
  const handled = useRef(false);
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    if (handled.current) return;

    const query = new URLSearchParams(window.location.search);

    const token = query.get("token");
  // const refreshToken = query.get("refreshToken"); // Not used
    const fullName = query.get("fullName");
    const userId = query.get("id") ? Number(query.get("id")) : 0;
    const role = query.get("role");
    const imageUrl = query.get("image");

      if (token) {
        // Tạo user object giống login trong store
        const user = {
          id: userId,
          email: '',
          fullName: fullName || '',
          role: role || 'Customer',
          phone: '',
          isActive: true,
          meta: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatar: imageUrl ?? ''
        };

        setUser(user);
        setToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.removeItem('guestId');

        (async () => {
          try {
            const { useCartStore } = await import('@/stores/cart');
            const { loadCartFromServer, syncToServer } = useCartStore.getState();
            const persisted = localStorage.getItem('cart-storage');
            let guestCartHasItems = false;
            if (persisted) {
              try {
                const parsed = JSON.parse(persisted);
                const persistedCart = parsed?.state?.cart ?? parsed?.cart ?? null;
                guestCartHasItems = !!(persistedCart && persistedCart.items && persistedCart.items.length > 0);
              } catch {
                guestCartHasItems = false;
              }
            }
            const userIdNumber = user.id ? Number(user.id) : 0;
            if (guestCartHasItems) {
              await syncToServer(token, userIdNumber);
              await loadCartFromServer(token, userIdNumber);
            } else {
              await loadCartFromServer(token, userIdNumber);
            }
          } catch {}
        })();

        toast.success(`Đăng nhập thành công! Xin chào ${fullName}`, {
          position: 'top-left',
          autoClose: 3000,
        });

        handled.current = true;

        if (role === 'Customer') {
          router.push('/products');
        } else if (role === 'Admin') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        toast.error('Đăng nhập thất bại!', {
          position: 'top-left',
        });
        router.push('/');
      }
  }, [router, setUser, setToken]);

  return <div className="p-6 text-center">Đang xử lý đăng nhập...</div>;
};

export default AuthCallback;
