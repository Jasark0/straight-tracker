import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/Header.css"

import { createClient } from "@/utils/supabase/server";

import ConditionalHeader from '../components/ConditionalHeader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title:{
        template: '%s | Straight Tracker',
        default: 'Straight Tracker',
    },
    description: 'Welcome to Straight Tracker, your go-to app for tracking pool matches and player statistics.',
    icons:{
        icon: '/straight-tab-logo.png',
    }
}

export default async function RootLayout({
    children,
}:{
    children: React.ReactNode,
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

 
    return (
        <html lang="en">
            <body className={`${inter.className}`}>
            <div>
                { <ConditionalHeader user={user}/>}
                <main>
                    {children}
                </main>
            </div>
            </body>
        </html>
    )
}
