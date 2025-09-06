// hooks/useAuth.ts
import { useRouter } from "next/router";
import { useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      router.push("/");
    }
    return res.ok;
  };

  const logout = () => {
    setUser(null);
    router.push("/login");
  };

  return { user, login, logout };
};
