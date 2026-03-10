"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignupMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { FormError } from "@/components/ui/form-error";
import { getErrorMessage, getFieldErrors } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UserPlus, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [signup, { isLoading }] = useSignupMutation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        displayName: "",
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        if (!termsAccepted) {
            setError("You must accept the terms and conditions to continue.");
            return;
        }

        try {
            const result = await signup(formData).unwrap();
            dispatch(
                setCredentials({
                    user: result.data.user,
                    token: result.data.token,
                })
            );
            router.push("/");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Signup failed. Please try again."));
            const errors = getFieldErrors(err);
            if (errors) {
                setFieldErrors(errors);
            }
        }
    };

    const getFieldError = (field: string): string | undefined => {
        return fieldErrors[field]?.[0];
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-muted/30">
            <div className="w-full max-w-md space-y-6">
                {/* Brand */}
                <div className="flex flex-col items-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                        C
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create your account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Join the Community and start connecting
                    </p>
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl">Sign Up</CardTitle>
                        <CardDescription>
                            Fill in the details below to create your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && <FormError message={error} />}

                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="displayName"
                                        type="text"
                                        placeholder="John Doe"
                                        className="pl-10"
                                        value={formData.displayName}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                displayName: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                {getFieldError("displayName") && (
                                    <p className="text-xs text-destructive">
                                        {getFieldError("displayName")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                {getFieldError("email") && (
                                    <p className="text-xs text-destructive">
                                        {getFieldError("email")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        className="pl-10"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                password: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                {getFieldError("password") && (
                                    <p className="text-xs text-destructive">
                                        {getFieldError("password")}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Must contain uppercase, lowercase, and a number
                                </p>
                            </div>

                            <div className="flex items-start space-x-3 py-2">
                                <Checkbox
                                    id="terms"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) =>
                                        setTermsAccepted(checked === true)
                                    }
                                />
                                <Label
                                    htmlFor="terms"
                                    className="text-sm font-normal leading-snug text-muted-foreground cursor-pointer"
                                >
                                    I agree to the{" "}
                                    <Link
                                        href="#"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        href="#"
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Privacy Policy
                                    </Link>
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || !termsAccepted}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Creating account…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <UserPlus className="h-4 w-4" />
                                        Create Account
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
