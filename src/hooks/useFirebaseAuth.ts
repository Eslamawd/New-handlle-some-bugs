
import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, loginWithEmailAndPassword, registerWithEmailAndPassword, logoutUser } from "@/lib/firebase";
import { toast } from "@/lib/toast";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await loginWithEmailAndPassword(email, password);
      toast.success("Logged in successfully!");
      return user;
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await registerWithEmailAndPassword(email, password);
      toast.success("Account created successfully!");
      return user;
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
      throw error;
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
}
