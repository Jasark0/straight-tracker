"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import { getUserSession, signOut } from '@/actions/auth';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        if (user){
            router.push('/history');
            return;
        }
        router.push('signup');
    }

    const settingsPage = () => {
        router.push('/settings');
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

    const handleSubmitSuggestion = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        const nameInput = form.elements.namedItem("name") as HTMLInputElement;
        const emailInput = form.elements.namedItem("email") as HTMLInputElement;
        const messageInput = form.elements.namedItem("message") as HTMLTextAreaElement;

        const formData = {
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value,
        };

        try{
            const res = await fetch("/api/sendEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const text = await res.text();
            toast.success("Thank you for contacting us! We will read your suggestion/inquiry thoroughly and get back to you as soon as we can.");
        } 
        catch (err){
            toast.error("Failed to send message.");
        }
    };

    return !isLoading && (
        <div className="home-page-container">
            <ToastContainer className="home-toast-container"/>

            <header className="home-title-container">
                <div className="home-header-logo-container" onClick={homePage}>
                    <img src="/straight-header-logo.png" className="home-header-logo-css"></img>
                    <img src="/straight-header-logo-text.png" className="home-header-logo-text-css"></img>
                </div>
                <div className="login-box">
                    {isLoading ? (
                    <div>Loading...</div>
                    ) : user ? (
                    <div className="home-header-buttons-box">
                        <button className="contact-us-button" onClick={() => document.getElementById("contact-us")?.scrollIntoView({ behavior: 'smooth' })}>
                            Contact Us
                        </button>
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
                        <div className="home-header-buttons-box">
                            <button className="contact-us-button" onClick={() => document.getElementById("contact-us")?.scrollIntoView({ behavior: 'smooth' })}>
                                Contact Us
                            </button>
                            <button className="learn-more-button" onClick={() => document.getElementById("learn-more")?.scrollIntoView({ behavior: 'smooth' })}>
                                Learn More
                            </button>
                            <button className="sign-in-button" onClick={signinPage}>
                                ↪ Sign In
                            </button>
                        </div>
                    )}
                </div>
            </header>


            <section className={user ? "hero-section hero-auth" : "hero-section"}>
                <div className="hero-content">
                    <p className="main-hero-heading">Your Professional Pool/Billiards Score Tracker</p>
                    <button className="get-started-button" onClick={signupPage}>🎱 Get Started</button>

                    {!user && (<div className="guest-access-box">
                        <p className="guest-subtext">
                            Want to give our tracker a shot but unsure about making an account?
                        </p>
                        <button className="guest-button">🎯 Continue as a Guest — Start a Match</button>
                    </div>)}
                </div>
            </section>

            <div className="hero-features">
                <div className="feature-card">🔥 Track Sets & Races</div>
                <div className="feature-card">📊 Analyze Match History</div>
                <div className="feature-card">🌐 Real-time Multiplayer (Coming Soon!)</div>
            </div>

            <div className="section-divider"></div>
            
            <section className="image-showcase" id="learn-more">
                <p className="home-about-us-text">About Us</p>
                <div className="home-image-container">
                    <img src="/8-ball-homepage.jpg" alt="Pool Table" className="pool-image" />
                    <p className="image-caption">
                        We offer a variety of games to allow users to track scores — whether you're playing a race or sets, 
                        your scores will be saved and ready to continue serious long races.
                    </p>
                </div>
            </section>

            <div className="section-divider"></div>

            <section className="image-showcase">
                <div className="home-image-container">
                    <p className="image-caption">
                        Currently, we have released 8-ball, 9-ball, 10-ball, straight pool (14.1 continuous). Our mission is to cover 
                        all professional/popular cue sports such as snooker, one pocket, and the billiards fans.
                    </p>
                    <img src="/snooker-homepage.jpg" alt="Straight Pool Table" className="snooker-image" />
                </div>
            </section>

            <div className="section-divider"></div>

            <section className="suggestion-box-container" id="contact-us">
                <p className="suggestion-contact-us-text">Contact Us</p>
                <form className="suggestion-form" onSubmit={handleSubmitSuggestion}>
                    <label>Name</label>
                    <input type="text" id="name" name="name" required />

                    <label>Email</label>
                    <input type="email" id="email" name="email" required />

                    <label>Suggestions / Inquires</label>
                    <textarea id="message" name="message" rows={8} required />

                    <button type="submit">Submit</button>
                </form>
            </section>
        </div>
    );
}
