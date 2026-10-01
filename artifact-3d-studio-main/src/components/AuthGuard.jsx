import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
export const AuthGuard = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(api.getUser());
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let isMounted = true;
        const checkAuth = async () => {
            const token = api.getToken();
            if (!token) {
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }
            const currentUser = await api.auth.getMe();
            if (isMounted) {
                setUser(currentUser);
                setLoading(false);
            }
        };
        checkAuth();
        const handleAuthChange = () => {
            setUser(api.getUser());
        };
        window.addEventListener("auth-state-change", handleAuthChange);
        return () => {
            isMounted = false;
            window.removeEventListener("auth-state-change", handleAuthChange);
        };
    }, []);
    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        }
    }, [user, loading, navigate]);
    if (loading) {
        return (<div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>);
    }
    if (!user) {
        return null;
    }
    return <>{children}</>;
};
