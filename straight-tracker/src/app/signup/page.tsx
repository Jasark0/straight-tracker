"use client";

import { useRouter } from 'next/navigation'
import { supabase } from '../../client'
import React, { useEffect, useState } from 'react'
import "../styles/General.css"
import "../styles/Home.css"
import "../styles/Signup.css"

const Signup: React.FC = () => {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const homePage = () => {
        router.push('/');
    }

    const signinPage = () => {
        router.push('/signin');
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [event.target.name]: event.target.value
            };
        });
    };
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword){
            setError('Passwords do not match.');
            return;
        }

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    username: formData.username
                })
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || 'Something went wrong.');
                return;
            }

            alert(result.message);
        } catch (err) {
            setError('Something went wrong. Try again.');
        }
    }

    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState <boolean|null>(null);

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
                <p className="title-text-css">Create an Account</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" 
                        placeholder="Your username" 
                        required 
                        pattern="^[A-Za-z0-9_]+$" 
                        title="Username can only contain letters, numbers, and underscores. No spaces."
                        name="username"
                        onChange= {handleChange}/>
                    </div>
                    {usernameAvailable === false && <p className="username-taken-css">Username is taken.</p>}
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                        type="email" 
                        placeholder="Email address" 
                        required 
                        name="email"
                        onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                        type="password" 
                        placeholder="Password" 
                        name="password"
                        onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input 
                        type="password" 
                        placeholder="Enter your password again" 
                        required
                        name="confirmPassword"
                        onChange={handleChange} />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="submit-btn">Sign Up</button>
                </form>
                <p className="or-css">
                    or
                </p>
                <img src="google.png" className="google-css"></img>
            </div>

        </div>
    )
}

export default Signup