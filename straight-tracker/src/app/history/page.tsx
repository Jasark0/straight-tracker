"use client";

import { useRouter } from 'next/navigation'
import React from 'react';

import "../styles/General.css"
import "../styles/History.css"

export default function History() {
    const router = useRouter();

    const homePage = () => {
        router.push('/');
    }

    return (
        <h1>
            History Page
        </h1>
    );
}
