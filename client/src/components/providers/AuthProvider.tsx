"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, logout } from "@/store/slices/authSlice";
import { useGetMeQuery } from "@/store/api/authApi";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const [token, setToken] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            setToken(storedToken);
        } else {
            setIsChecking(false);
            dispatch(logout());
        }
    }, [dispatch]);

    const { data, isLoading, isError, isSuccess } = useGetMeQuery(undefined, {
        skip: !token,
    });

    useEffect(() => {
        if (isSuccess && data?.success && data?.data?.user && token) {
            dispatch(setCredentials({ user: data.data.user, token }));
            setIsChecking(false);
        } else if (isError) {
            localStorage.removeItem("token");
            dispatch(logout());
            setIsChecking(false);
        }
    }, [isSuccess, isError, data, token, dispatch]);

    if (isChecking || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
