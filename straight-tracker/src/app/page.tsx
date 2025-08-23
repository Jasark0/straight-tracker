"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react';
import { getUserSession } from '@/actions/auth';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loading from '@/src/components/PageLoading'
import { LastOnlineStatus } from '../components/LastOnlineStatus';
import { OnlinePlayerCount } from '@/src/components/OnlinePlayerCount';
import { Probe } from '../components/Probe';

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

    const homePage = () => {
        router.push('/');
    };

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

    const [isChangelogOpen, setIsChangelogOpen] = useState(false);

    const changelog = [
        {
        version: "v0.1.3",
        date: "2025-08-16",
        changes: [
            "Footer added in homepage",
            "Change log added in footer that keeps track of versions & updates",
            "History page now functions in mobile devices",
            "History page now has pagination",
            "Straight pool page now has foul counter",
            "Matches in history page will update continued at time, this will be displayed differently in details modal"
        ]
        },
        {
        version: "v0.1.2",
        date: "2025-08-14",
        changes: [
            "Lag winner will only display in details tab if user selects a lag winner.",
            "Winner name is now more clear in the event of player1 and player2 being identical",
            "Filter container redesign (Tabs + Better outlook)",
            "Filter buttons can be deselected",
            "Filter by winner, player, race to & sets, race to ranges & sets ranges",
            "Filter container will be displayed as a hamburger icon on mobile devices",
            "Filter container now has horizontal swiping animations",
            "History matches will all display if filtering game type has no selections",
            "Details tab now has created at time & continue/delete match buttons",
            "Fixed a critical bug of match not saving when clicking on header buttons in tracker pages"
        ]
        },
        {
        version: "v0.1.0",
        date: "2025-08-03",
        changes: [
            "Update database tables to link matches with profile using UUID instead of username",
            "History, Configure, Guest select page css touchups",
            "Header dynamically buttons depending on what page you're on",
            "Profile picture working, nickname & username fixes",
            "Small general changes",
            "Select page > select game doesn't require you to click the next button."
        ]
        }
    ];

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

    // Prevent scrolling if the changelog is open
    useEffect(() => {
        if (isChangelogOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isChangelogOpen]);

    if (loading){
        return <Loading/>;
    }

    return (
        <div className="home-page-container">  
            <ToastContainer className="home-toast"/>
            <Probe />
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

                        <div className="home-online-indicator">
                        <OnlinePlayerCount />
                    </div>
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

                    <label>Suggestions / Inquiries</label>
                    <textarea id="message" name="message" rows={8} required />

                    <button type="submit">Submit</button>
                </form>
            </section>

            <section className="home-footer-container">
                <div className="home-footer-content">
                    <div className="home-footer-logo-container" onClick={homePage}>
                        <img src="/straight-header-logo.png" className="header-logo"></img>
                        <img src="/straight-header-logo-text.png" className="header-logo-text"></img>
                    </div>
                    <button
                        onClick={() => setIsChangelogOpen(true)}
                        className="changelog-link-button"
                        >
                        Change Log
                    </button>
                </div>
                <div className="home-footer-bottom">
                    <p>© {new Date().getFullYear()} Straight Tracker — All rights reserved.</p>
                </div>
            </section>

            {isChangelogOpen && (
                <div className="changelog-overlay">
                <div className="changelog-modal">
                    <button
                    className="changelog-close-button"
                    onClick={() => setIsChangelogOpen(false)}
                    >
                    ✕
                    </button>
                    <h1>Change Log</h1>
                    <div className="changelog-modal-content">
                    {changelog.map((entry, index) => (
                        <div key={index} className="changelog-entry">
                        <h2>
                            {entry.version} —{" "}
                            <span className="changelog-entry-date">{entry.date}</span>
                        </h2>
                        <ul>
                            {entry.changes.map((change, i) => (
                                <li key={i}>{change}</li>
                            ))}
                        </ul>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}
