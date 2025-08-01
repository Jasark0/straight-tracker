"use client";

import { redirect, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { forgotPassword, resetPassword, signIn, signInWithGoogle } from '@/actions/auth';

const Resetpassword: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await resetPassword(
            formData,
        searchParams.get("code") as string);

        if ( result.status === "success") {
            router.push("/");
        } else {
            setError(result.status);
        }
    }

    const signUpPage = () => {
        router.push('/signup');
    }

    return (
        <div className="signin-page-box">
            <div className="sign-up-box">
                <p className="title-text-css">Reset Password</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="New Password"
                            required
                            name="password"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-btn">Reset Password</button>
                </form>
            </div>

        </div>
    )
}

export default Resetpassword