"use client";

import { redirect, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { signInWithGoogle, signUp } from '@/actions/auth';

const Signup: React.FC = () => {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        nickname: '',
        password: '',
        confirmPassword: ''
    });
    const [usernameAvailable, setUsernameAvailable] = useState <boolean|null>(null);
    const [emailAvailable, setEmailAvailable] = useState <boolean|null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showVerificationPopup, setShowVerificationPopup] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await signUp(formData);

        if (result.status === "success") {
            // Simple HTML alert popup
            alert("Email verification sent! Please check your email and click the verification link to activate your account.");
            router.push("/signin");
        } else {
            setError(result.status);
        }

        setLoading(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [event.target.name]: event.target.value
            };
        });
    };

    useEffect(() => {
        const username = formData.username;

        if (!username) {
            setUsernameAvailable(null);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const res = await fetch(`/api/usernameExists?username=${encodeURIComponent(username)}`);
                const json = await res.json();
                setUsernameAvailable(json.available);
            } catch {
                setUsernameAvailable(null);
            } 
        }, 300);

        return () => clearTimeout(handler);
    }, [formData.username]);

    useEffect(() => {
        const email = formData.email;

        if (!email) {
            setUsernameAvailable(null);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const res = await fetch(`/api/emailExists?email=${encodeURIComponent(email)}`);
                const json = await res.json();
                setEmailAvailable(json.available);
            } catch {
                setEmailAvailable(null);
            } 
        }, 300);

        return () => clearTimeout(handler);
    }, [formData.email]);

    const homePage = () => {
        router.push('/');
    }
    const signInPage = () => {
        router.push('/signin');
    }



    return (
        <div className="signup-page-box">
            <div className="sign-up-box">
                <p className="title-text-css">Create an Account</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" 
                        placeholder="Your username" 
                        required 
                        pattern="^[A-Za-z0-9_]{3,}$"
                        title="Username must be at least 3 characters and can only contain letters, numbers, and underscores. No spaces."
                        name="username"
                        onChange={handleChange}
                    />
                    </div>
                    {usernameAvailable === false && <p className="username-taken-css">Username is taken.</p>}
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                        type="email" 
                        placeholder="Email address" 
                        required 
                        name="email"
                        onChange={handleChange}
                        />
                    </div>
                    {emailAvailable === false && <p className="email-taken-css">Email is used.</p>}
                    <div className="form-group">
                        <label>Nickname</label>
                        <input type="text" 
                        placeholder="Your nickname (Optional)" 
                        pattern="^[A-Za-z0-9_]{3,}$"
                        title="Nickname must be at least 3 characters and can only contain letters, numbers, and underscores. No spaces."
                        name="nickname"
                        onChange={handleChange}
                    />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                        type="password" 
                        placeholder="Password" 
                        name="password"
                        onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                        type="password" 
                        placeholder="Enter your password again" 
                        required
                        minLength={8}
                        name="confirmPassword"
                        title="Password must be at least 8 characters."
                        onChange={handleChange}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-btn">Sign Up</button>
                </form>
                <p className="already-text-css" onClick={signInPage}>
                    Already have an account?
                </p>
                <p className="or-css">
                    or
                </p>
                <img src="google.png" className="google-css" onClick={signInWithGoogle}></img>
            </div>
        </div>
    )
}

export default Signup