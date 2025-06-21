"use client";

import { redirect, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { supabase} from '../../../client'

import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/Signup.css"
import { forgotPassword, resetPassword, signIn, signInWithGoogle } from '@/actions/auth';
import Header from '@/src/components/Header';

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
        <div className="page-box">
            <Header />

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