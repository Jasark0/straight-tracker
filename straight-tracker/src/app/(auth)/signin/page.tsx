"use client";

import { redirect, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { supabase} from '../../../client'

import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/Signup.css"
import { signIn, signInWithGoogle } from '@/actions/auth';
import Header from '@/src/components/Header';

const Signin: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await signIn(formData);

        if ( result.status === "success") {
            router.push("/");
        } else {
            setError(result.status);
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [event.target.name]: event.target.value
            };
        });
    };

    async function handleSignUpWithGoogle() {
        try {
            const res = await fetch('/api/googleAuth');
            const data = await res.json();

            if (!res.ok || !data.url) {
                setError(data.error || 'Could not authenticate user.');
                return;
            }

            window.location.href = data.url;
        } catch (error) {
            setError('Something went wrong. Please try again.');
        }
    }

    async function handleSignin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier: formData.identifier,
                    password: formData.password
                })
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || 'Something went wrong.');
                return;
            }

            router.push('/history');
        } catch (err) {
            setError('Something went wrong. Try again.');
        }
    };    

    const signUpPage = () => {
        router.push('/signup');
    }

    return (
        <div className="page-box">
            <Header />

            <div className="sign-up-box">
                <p className="title-text-css">Sign in to Straight Tracker</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username/Email</label>
                        <input
                            type="text"
                            placeholder="Your email"
                            required
                            name="identifier"
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
                        required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-btn">Sign In</button>
                </form>
                <p className="already-text-css" onClick={signUpPage}>
                    Don't have an account?
                </p>
                <p className="or-css">
                    or
                </p>
                <img src="google.png" className="google-css" onClick={signInWithGoogle}></img>
            </div>

        </div>
    )
}

export default Signin