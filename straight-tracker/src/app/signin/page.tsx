"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { supabase} from '../../client'

import "../styles/General.css"
import "../styles/Home.css"
import "../styles/Signup.css"

const Signup: React.FC = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    console.log(formData);

    const homePage = () => {
        router.push('/');
    }

    // const signinPage = () => {
    //     router.push('/signin');
    // }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [event.target.name]: event.target.value
            };
        });
    };

    

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })
            if (error) throw error;
            console.log(data);
            
            router.push('/tracker');
        } catch (error) {
            alert(error +"\n");
            return;
        }
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
                        <input
                            type="text"
                            placeholder="Your email"
                            required
                            name="email"
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
                <p className="or-css">
                        or
                </p>
                <img src="google.png" className="google-css"></img>
            </div>

        </div>
    )
}

export default Signup