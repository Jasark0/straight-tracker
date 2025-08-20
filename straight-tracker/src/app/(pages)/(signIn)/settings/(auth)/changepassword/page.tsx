"use client";

import { redirect, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { forgotPassword, resetPassword, signIn, signInWithGoogle } from '@/actions/auth';

import Loading from '@/src/components/PageLoading'

const Changepassword: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!searchParams.get("code")) {
            router.push('/');
        }
    }, [searchParams, router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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

    if (loading){
        return <Loading/>;
    }

    return (
        <div className="signin-page-box">
            <div className="sign-up-box">
                <p className="title-text-css">Change Password</p>
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
                    <button type="submit" className="submit-btn">Change Password</button>
                </form>
            </div>

        </div>
    )
}

export default Changepassword