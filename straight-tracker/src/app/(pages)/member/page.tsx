"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { changeNickname, changePassword, changeUsername, getUserSession, updateAvatarInProfile, updateProfile } from '@/actions/auth';
import "@/src/app/styles/General.css"
import "@/src/app/styles/Home.css"
import "@/src/app/styles/Settings.css"
import { Edit } from "lucide-react";
import Avatar from '@/src/app/(pages)/(signIn)/settings/avatar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactiveButton from 'reactive-button';


export default function MemberPage() {
    const router = useRouter();
   
    return (
        <div className="settings-page-box">
            <ToastContainer className="signin-toast" />
            <div>Error 404</div>
        </div>
    );
}
