"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import { getUserSession, signOut } from '@/actions/auth';


export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profileHovered, setProfileHovered] = useState(false);

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
            <header className="home-title-container">
                <div className="header-logo-container" onClick={homePage}>
                    <img src="/straight-header-logo.png" className="header-logo-css"></img>
                    <img src="/straight-header-logo-text.png" className="header-logo-text-css"></img>
                </div>
                <div className="login-box">
                    {isLoading ? (
                    <div>Loading...</div>
                    ) : user ? (
                    <div className="header-buttons-box">
                        <button className="learn-more-button" onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: 'smooth' })}>
                            Learn More
                        </button>
                        <button className="my-games-css" onClick={handleHistory}>
                            My Games
                        </button>
                        <div className="profile-container" onMouseEnter={() => setProfileHovered(true)} onMouseLeave={() => setProfileHovered(false)}>
                            <img src="default-profile-picture.jpg" className="profile-css"></img>
                            {profileHovered && (
                                <div className="profile-dropdown-menu">
                                    <button className="profile-dropdown-button"><span className="dropdown-icon">⚙️</span>Settings</button>
                                    <div className="dropdown-divider"></div>
                                    <button className="profile-dropdown-button sign-out" onClick={handleSignOut}><span className="dropdown-icon">⏻</span>Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                    ) : (
                        <>
                            <button className="learn-more-button" onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: 'smooth' })}>
                                Learn More
                            </button>
                            <button className="sign-in-button" onClick={signinPage}>
                                ↪ Sign In
                            </button>
                        </>
                    )}
                </div>
            </header>

            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="main-hero-heading">Your Professional Pool/Billiards Score Tracker</h1>
                    <button className="get-started-button" onClick={signupPage}>🎱 Get Started</button>

                    <div className="guest-access-box">
                    <p className="guest-subtext">
                        Want to give our tracker a shot but unsure about making an account?
                    </p>
                    <button className="guest-button">🎯 Continue as a Guest — Start a Match</button>
                    </div>
                </div>
            </section>

            <section className="image-showcase" id="learn-more">
                <img src="/8-ball-homepage.jpg" alt="Pool Table" className="pool-image" />
                <p className="image-caption">
                    We offer a variety of games to allow users to track scores — whether you're playing a race or sets, 
                    your scores will be saved and ready to continue serious long races.
                </p>
            </section>
        </div>
    );
}
