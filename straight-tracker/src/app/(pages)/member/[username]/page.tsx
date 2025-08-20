import { getPublicProfile } from '@/actions/auth';
import "@/src/app/styles/General.css";
import "@/src/app/styles/Home.css";
import "@/src/app/styles/Member.css";
import { notFound } from 'next/navigation';
import React from 'react';

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
                            <p className="member-user-details-text">User Details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
