"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getUserSession, signOut } from '@/actions/auth';
import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/Settings.css" // Make sure settings styles are imported

import Header from '@/src/components/Header';
import Settings from '@/src/components/Settings'; // This should be the default export from Settings.tsx

export default function SettingsPage() {
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

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error("Sign out error:", error);
      const session = await getUserSession();
      setUser(session?.user || null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading state while fetching user data
  }

  return (
    <div className="settings-page-box">
      <Header />
        
      {/* 
        Render the Settings component and pass the fetched user data down as props.
        This avoids the infinite loop and displays the correct user information.
      */}
      <Settings
        nickname={user?.user_metadata?.nickname}
        username={user?.user_metadata?.username}
        email={user?.email}
        profileImage={user?.user_metadata?.avatar_url}
      />
    </div>
  );
}
