"use client";

import { redirect, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { forgotPassword, resetPassword, signIn, signInWithGoogle } from '@/actions/auth';
import Header from '@/src/components/Header';

const Forgotpassword: React.FC = () => {
    const router = useRouter();
    

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await forgotPassword(formData);

        if ( result.status === "success") {
            alert("Forgot Password sent! Please check your email and click the link to reset your password.");
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
            <Header />

            <div className="sign-up-box">
                <p className="title-text-css">Reset Password</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="text"
                            placeholder="Your email"
                            required
                            name="email"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-btn">Reset Password</button>
                </form>
            </div>

        </div>
    )
}

export default Forgotpassword