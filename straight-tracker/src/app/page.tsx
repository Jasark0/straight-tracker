"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import { getUserSession } from '@/actions/auth';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '@/src/components/Header'
import Loading from '@/src/components/PageLoading'

export default function Home() {
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    
    const [loading, setLoading] = useState(true);
  
    const signupPage = () => {
        if (user){
            router.push('/history');
            return;
        }
        router.push('signup');
    }

    const handleGuest = () => {
        router.push('/guest/selectGame');
    }

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
            if (text){
                nameInput.value = "";
                emailInput.value = "";
                messageInput.value = "";

                toast.success("Thank you for contacting us! We will read your suggestion/inquiry thoroughly and get back to you as soon as we can!");
            }
        } 
        catch (err){
            toast.error("Failed to send message.");
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            const session = await getUserSession();
            setUser(session?.user);
            setLoading(false);
        };
        fetchUser();
    }, []);

    if (loading){
        return <Loading/>;
    }

    return (
        <div className="home-page-container">  
            <ToastContainer className="home-toast-container"/>
            
            <div className="hero-container">
                <section className={user ? "hero-section hero-auth" : "hero-section"}>
                    <div className="hero-content">
                        <p className="main-hero-heading"><span>Your Professional Pool/Billiards <br/> Score Tracker</span></p>
                        <button className="get-started-button" onClick={signupPage}>🎱 Get Started</button>

                        {!user && (<div className="guest-access-box">
                            <p className="guest-subtext">
                                Want to give our tracker a shot but unsure about making an account?
                            </p>
                            <button className="guest-button" onClick={handleGuest}>🎯 Continue as a Guest — Start a Match</button>
                        </div>)}
                    </div>
                </section>

                <div className="hero-features">
                    <div className="feature-card">🔥 Track Sets & Races</div>
                    <div className="feature-card">📊 Analyze Match History</div>
                    <div className="feature-card">🌐 Real-time Multiplayer (Coming Soon!)</div>
                </div>
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
                        all professional/popular cue sports such as snooker, one pocket, and carom games for the billiards fans.
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
