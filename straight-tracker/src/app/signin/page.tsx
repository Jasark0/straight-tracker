"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import "../styles/General.css"
import "../styles/Home.css"
import "../styles/Signup.css"

const Signup: React.FC = () => {
    const router = useRouter();
    
    const homePage = () => {
        router.push('/');
    }

    // const signinPage = () => {
    //     router.push('/signin');
    // }

    const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword){
            setError("Passwords do not match.");
            return;
        }

        setError('');
        console.log("Sign up submitted");
    };
    

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState <boolean|null>(null);
    
    async function checkUsernameAvailability(name: string){
        try{
            const res = await fetch(`/api/usernameExists?username=${encodeURIComponent(name)}`);
            const data = await res.json();
            console.log("something");
            setUsernameAvailable(data.available);
        }
        catch (err){
            setUsernameAvailable(null);
        }
    }

    useEffect(() => {
        if (username === ''){
            setUsernameAvailable(null);
            return;
        }

        const handler = setTimeout(() => {
            checkUsernameAvailability(username);
        }, 500);

        return () => clearTimeout(handler);
    }, [username]);

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
                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label>Username/Email</label>
                        <input type="text" placeholder="Your name" required pattern="^[A-Za-z0-9_]+$" title="Username can only contain letters, numbers, and underscores"
                        value={username} onChange={(e) => setUsername(e.target.value)}/>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="Password" value={password} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="submit-btn">Sign In</button>
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