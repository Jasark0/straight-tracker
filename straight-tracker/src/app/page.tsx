"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import "./styles/General.css"
import "./styles/Home.css"
import { getUserSession, signOut } from '@/actions/auth';


export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
    const fetchUser = async () => {
        const session = await getUserSession();
        setUser(session?.user);
        setIsLoading(false);
    };
    fetchUser();
    }, []);

    const homePage = () => {
        router.push('/');
    }

    const signinPage = () => {
        router.push('/signin');
    }
  
    const signupPage = () => {
        router.push('signup');
    }

    const handleHistory = async () => {
        router.push('/history');
    }

    const handleSignOut = async () => {
        try{
            await signOut();
            window.location.reload();
        } 
        catch (error){
            const session = await getUserSession();
            setUser(session?.user || null);
        }
    };

    return (
        <div className="home-page-container">
            <div className="home-title-box">
                <div className="header-logo-container" onClick={homePage}>
                    <img src="/straight-header-logo.png" className="header-logo-css"></img>
                    <img src="/straight-header-logo-text.png" className="header-logo-text-css"></img>
                </div>
                <div className="login-box">
                    {isLoading ? (
                    <div>Loading...</div>
                    ) : user ? (
                    <div className="header-buttons-box">
                        <button className="my-games-css" onClick={handleHistory}>
                            My Games
                        </button>
                        <img src="default-profile-picture.jpg" className="profile-css" onClick={handleSignOut}>
                            
                        </img>
                    </div>
                    ) : (
                        <>
                            <button className="sign-in-button" onClick={signinPage}>
                                ↪ Sign In
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
