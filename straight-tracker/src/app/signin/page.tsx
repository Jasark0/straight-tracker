"use client";

import { redirect, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { supabase} from '../../client'

import "../styles/General.css"
import "../styles/Home.css"
import "../styles/Signup.css"

const Signin: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    })
    const [error, setError] = useState('');

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
        
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`,
                }
            });
    
            if (data.url) {
                redirect(data.url);
                return;
            }
    
            if (error) {
                setError(error.message);
                return;
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

    const homePage = () => {
        router.push('/');
    }
    const signUpPage = () => {
        router.push('/signup');
    }

    return (
        <div className="page-box">
            <div className="home-title-box">
                <div className="logo-box" onClick={homePage}>
                    <img src="/straight-tracker-logo.png" className="logo-css"></img>
                    <p className="home-title-name">
                        Straight Tracker
                    </p>
                </div>
            </div>

            <div className="sign-up-box">
                <p className="title-text-css">Sign in to Straight Tracker</p>
                <form onSubmit={handleSignin}>
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
                    <button type="submit" className="submit-btn">Sign In</button>
                </form>
                <p className="already-text-css" onClick={signUpPage}>
                    Don't have an account?
                </p>
                <p className="or-css">
                    or
                </p>
                <img src="google.png" className="google-css" onClick={handleSignUpWithGoogle}></img>
            </div>

        </div>
    )
}

export default Signin