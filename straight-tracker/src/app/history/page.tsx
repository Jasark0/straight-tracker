"use client";

import { useRouter } from 'next/navigation'
import React from 'react';

import "../styles/General.css"
import "../styles/Home.css"
import "../styles/History.css"

export default function History() {
  const router = useRouter();

  const homePage = () => {
      router.push('/');
  }

  const games = [
  {
    id: 1,
    title: "14.1 Straight Pool – Session 1",
    date: "2025-06-10",
    player1: "You",
    player2: "AI",
    status: "In Progress",
  },
  {
    id: 2,
    title: "8-Ball Match – Friendly",
    date: "2025-06-08",
    player1: "You",
    player2: "John",
    status: "Completed",
  },
  {
    id: 3,
    title: "9-Ball Race to 7",
    date: "2025-06-05",
    player1: "You",
    player2: "Emily",
    status: "In Progress",
  },
];


  return (
    <div className="home-title-box">
        <div className="logo-box" onClick={homePage}>
            <img src="/straight-tracker-logo.png" className="logo-css"></img>
            <p className="home-title-name">
                Straight Tracker
            </p>
        </div>

        
    </div>
  );
}
