"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { resetPassword } from '@/actions/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Resetpassword: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await resetPassword(formData, searchParams.get("code") as string);

        if (result.status === "success"){
            router.push('/history?success=1');
        } 
        else{
            toast.error('Error resetting password.');
        }
    }

    return (
        <div className="signin-page-container">
            <ToastContainer className="signin-toast"/>
            <div className="signin-container">
                <p className="signin-title-text">Reset Password</p>
                <form onSubmit={handleSubmit}>
                    <div className="signin-form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            placeholder="New Password"
                            required
                            name="password"
                        />
                    </div>
                    {error && <p className="signin-error-message">{error}</p>}
                    <button type="submit" className="signin-button">Reset Password</button>
                </form>
            </div>

        </div>
    )
}

export default Resetpassword