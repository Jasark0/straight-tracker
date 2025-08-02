"use client";

import React, { useState } from 'react'
import { forgotPassword } from '@/actions/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Forgotpassword: React.FC = () => {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const form = e.currentTarget;
        const formData = new FormData(e.currentTarget);
        const emailInput = form.elements.namedItem("email") as HTMLInputElement;

        const result = await forgotPassword(formData);

        if ( result.status === "success") {
            toast.success("Check your inbox to reset your password.")
            emailInput.value = "";
        } else {
            setError(result.status);
        }
    }

    return (
        <div className="signin-page-container">
            <ToastContainer className="signin-toast"/>
            <div className="signin-container">
                <p className="signin-title-text">Reset Password</p>
                <form onSubmit={handleSubmit}>
                    <div className="signin-form-group">
                        <label>Email</label>
                        <input
                            type="text"
                            placeholder="Your email"
                            required
                            name="email"
                        />
                    </div>
                    {error && <p className="signin-error-message">{error}</p>}
                    <button type="submit" className="signin-button">Reset Password</button>
                </form>
            </div>
        </div>
    )
}

export default Forgotpassword