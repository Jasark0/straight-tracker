"use client";

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { signIn, signInWithGoogle } from '@/actions/auth';

const Signin: React.FC = () => {
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await signIn(formData);

        if (result.status === "success") {
            router.push("/");
        } else {
            setError(result.status);
        }
    }

    const signUpPage = () => {
        router.push('/signup');
    }

    const forgotPasswordPage = () => {
        router.push('/forgotpassword');
    }

    return (
        <div className="signin-page-container">
            <div className="signin-container">
                <p className="signin-title-text">Sign in to Straight Tracker</p>

                <form onSubmit={handleSubmit}>
                    <div className="signin-form-group">
                        <label>Username/Email</label>
                        <input
                            type="text"
                            placeholder="Your email"
                            required
                            name="identifier"
                        />
                    </div>
                    <div className="signin-form-group">
                        <label>Password</label>
                        <input 
                        type="password" 
                        placeholder="Password" 
                        name="password"
                        required />
                    </div>
                    {error && <p className="signin-error-message">{error}</p>}

                    <button type="submit" className="signin-button">Sign In</button>
                </form>

                <p className="signin-dont-text" onClick={signUpPage}>Don't have an account? Sign up here.</p>
                <p className="signin-forgot-text" onClick={forgotPasswordPage}>Forgot your Password?</p>
                <p className="signin-or-text">or</p>

                <img src="google.png" className="signin-google-icon" onClick={signInWithGoogle}></img>
            </div>
        </div>
    )
}

export default Signin