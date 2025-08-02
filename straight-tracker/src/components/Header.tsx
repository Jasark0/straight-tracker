"use client";

import { useRouter, usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { signOut } from '@/actions/auth';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type HeaderProps = {
    user: any;
};

const PageHeader: React.FC<HeaderProps> = ({user}) => {
    const router = useRouter();
    const pathname = usePathname();

    const [profileHovered, setProfileHovered] = useState(false);
    
    const homePage = () => {
        router.push('/');
    };

    const handleHistory = async () => {
        router.push('/history');
    }

    const settingsPage = () => {
        router.push('/settings');
    }

    const signinPage = () => {
        router.push('/signin');
    }

    const handleSignOut = async () => {
        try{
            await signOut();
            window.location.href = '/';
        } 
        catch (error){
            toast.error('Error signing out.');
        }
    };

    const isGuestPage = pathname.startsWith('/guest');
    const isHomePage = pathname === '/';
    const isHistoryPage = pathname === '/history';
    const isSignIn = pathname === '/signin';
    const isSignUp = pathname === '/signup';

    return (
        <>
            <ToastContainer/>
            <header className="header-container">
                <div className="header-logo-container" onClick={homePage}>
                    <img src="/straight-header-logo.png" className="header-logo"></img>
                    <img src="/straight-header-logo-text.png" className="header-logo-text"></img>
                </div>

                {!isGuestPage && (
                    <div className="header-info-container">
                        {isHomePage && (
                            <>
                                <button className="header-contact-us-button" onClick={() => document.getElementById("contact-us")?.scrollIntoView({ behavior: 'smooth' })}>
                                    Contact Us
                                </button>
                                <button className="header-learn-more-button" onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: 'smooth' })}>
                                    Learn More
                                </button>
                            </>
                        )}
                        
                        {!isHistoryPage && user && (
                            <button className="header-my-games-button" onClick={handleHistory}>
                                My Games
                            </button>
                        )}

                        {user && (
                            <div className="header-profile-container" onMouseEnter={() => setProfileHovered(true)} onMouseLeave={() => setProfileHovered(false)}>
                                <img src="/default-profile-picture.jpg" className="header-profile"></img>
                                {profileHovered && (
                                    <div className="header-profile-dropdown">
                                        <button className="header-profile-dropdown-button" onClick={settingsPage}><span className="header-profile-dropdown-icon">⚙️</span>Settings</button>
                                        <div className="header-profile-dropdown-divider"></div>
                                        <button className="header-profile-dropdown-button sign-out" onClick={handleSignOut}><span className="header-profile-dropdown-icon">⏻</span>Sign Out</button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {(!isSignIn && !isSignUp) && !user && (
                            <button className="header-sign-in-button" onClick={signinPage}>
                                ↪ Sign In
                            </button>
                        )}
                    </div>
                )}
            </header>
        </>
    );
};

export default PageHeader;
