import { getPublicProfile } from '@/actions/auth';
import "@/src/app/styles/General.css";
import "@/src/app/styles/Home.css";
import "@/src/app/styles/Member.css";
import { notFound } from 'next/navigation';
import React from 'react';
import { OnlineStatus } from '@/src/components/OnlineStatus'

type Profile = {
    username: string;
    nickname: string;
    avatar_url: string;
};

export default async function MemberPage({ params }: { params: { username: string } }) {
    const { username } = await params;
    const { data: profile, error } = await getPublicProfile(username);

    if (error || !profile) {
        notFound();
    }

    
    const getDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
        });
    };

    const timeAgo = (dateString: string | null): string => {
        if (!dateString) {
            return 'Unknown';
        }

        const now = new Date();
        const past = new Date(dateString);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (seconds < 10) return "just now";
        if (seconds < 60) return `${seconds} seconds ago`;

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    

    const profileImage = profile.avatar_url || "/default-profile-picture.jpg";

    return (
        <div className="member-page-box">
            <div className="member-layout">
                <div className="member-container">

                    <div className="member-content">
                        <div className="member-profileSection">
                            <div className="member-profileImage">
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="member-profileImageInner"
                                />
                            </div>
                        </div>

                        <div className="member-infoSection">
                            <h1 className="member-infoNickname">{profile.nickname || profile.username}</h1>
                            <h2 className="member-infoUsername">@{profile.username}</h2>
                        </div>

                        <button className="member-editProfile-Button">Edit Profile</button>

                        <div className="member-user-details-info">
                            <p className="member-user-details-text">{getDate(profile.created_at)} joined</p>
                            <p className="member-user-details-text"> 
                                Last Online: {timeAgo(profile.last_sign_in_at)}
                            </p>
                            <p className="member-user-details-text">
                                <OnlineStatus userId={profile.id} />
                            </p>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}
