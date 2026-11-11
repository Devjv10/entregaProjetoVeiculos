import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, errorMessage } from "../services/api";
import type { User } from "../types";

type Session = { user: User; token: string };
type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  retry: () => void;
  acceptSession: (session: Session) => void;
  logout: () => void;
};
const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    setError("");
    if (!sessionStorage.getItem("driveflow-token")) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<{ data: User }>("/auth/me")
      .then((response) => {
        if (alive) setUser(response.data.data);
      })
      .catch((error) => {
        if (alive && sessionStorage.getItem("driveflow-token"))
          setError(errorMessage(error));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [revision]);
  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener("driveflow-session-expired", expire);
    return () =>
      window.removeEventListener("driveflow-session-expired", expire);
  }, []);
  function acceptSession(session: Session) {
    sessionStorage.setItem("driveflow-token", session.token);
    setUser(session.user);
    setError("");
  }
  function logout() {
    sessionStorage.removeItem("driveflow-token");
    setUser(null);
    setError("");
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        retry: () => setRevision((v) => v + 1),
        acceptSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider ausente.");
  return value;
}
