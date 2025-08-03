"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import { getUserSession } from '@/actions/auth';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loading from '@/src/components/PageLoading'

export default function Home() {
    const router = useRouter();
    const searchParams = useSearchParams();

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

        const message = searchParams.get('message');
        if (message === 'verification_confirmed') {
            toast.success("🎉 Verification confirmed, enjoy!",
                { autoClose: 10000 }
            );
            
            const url = new URL(window.location.href);
            url.searchParams.delete('message');
            window.history.replaceState({}, '', url.toString());
        }
    }, [searchParams]);

    if (loading){
        return <Loading/>;
    }

    return (
        <div className="home-page-container">  
            <ToastContainer className="home-toast"/>
            <div className="home-center-container">
                <section className={user ? "home-center-section home-center-auth" : "home-center-section"}>
                    <div className="home-center-content">
                        <p className="home-center-text"><span>Your Professional Pool/Billiards <br/> Score Tracker</span></p>
                        <button className="home-get-started-button" onClick={signupPage}>🎱 Get Started</button>

                        {!user && (<div className="home-guest-container">
                            <p className="home-guest-text">
                                Want to give our tracker a shot but unsure about making an account?
                            </p>
                            <button className="home-guest-button" onClick={handleGuest}>🎯 Continue as a Guest — Start a Match</button>
                        </div>)}
                    </div>
                </section>

                <div className="home-features-container">
                    <div className="home-feature-card">🔥 Track Sets & Races</div>
                    <div className="home-feature-card">📊 Analyze Match History</div>
                    <div className="home-feature-card">🌐 Real-time Multiplayer (Coming Soon!)</div>
                </div>
            </div>
            
            <div className="home-section-divider"></div>

            <section className="home-about-us-container" id="learn-more">
                <p className="home-about-us-text">About Us</p>
                <div className="home-image-container">
                    <img src="/8-ball-homepage.jpg" alt="Pool Table" className="home-pool-image"/>
                    <p className="home-pool-image-caption">
                        We offer a variety of games to allow users to track scores — whether you're playing a race or sets, 
                        your scores will be saved and ready to continue serious long races.
                    </p>
                </div>
            </section>

            <div className="home-section-divider"></div>

            <section className="home-about-us-container">
                <div className="home-image-container">
                    <p className="home-snooker-image-caption">
                        Currently, we have released 8-ball, 9-ball, 10-ball, straight pool (14.1 continuous). Our mission is to cover 
                        all professional/popular cue sports such as snooker, one pocket, and carom games for the billiards fans.
                    </p>
                    <img src="/snooker-homepage.jpg" alt="Straight Pool Table" className="home-snooker-image"/>
                </div>
            </section>

            <div className="home-section-divider"></div>

            <section className="home-suggestion-container" id="contact-us">
                <p className="home-contact-us-text">Contact Us</p>
                <form className="home-suggestion-form" onSubmit={handleSubmitSuggestion}>
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
