'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ConfirmSignupPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const successParam = searchParams.get('success');

        if (errorParam) {
            setError(decodeURIComponent(errorParam));
            setLoading(false);
        } else if (successParam === 'true') {
            setSuccess(true);
            setLoading(false);
            
            setTimeout(() => {
                router.push('/signin?message=Email confirmed successfully! You can now sign in.');
            }, 2000);
        } else {
            setLoading(false);
        }
    }, [searchParams, router]);

    return (
        <div className="signin-page-container">
        <div className="confirm-signup-container">
            <div className="confirm-signup-card">
                <div className="confirm-signup-header">
                    <img
                        className="confirm-signup-logo"
                        src="/straight-header-logo.png"
                        alt="Straight Tracker"
                    />
                    <h2 className="confirm-signup-title">
                        Email Confirmation
                    </h2>
                    <p className="confirm-signup-subtitle">
                        {success ? 'Your email has been confirmed!' : error ? 'There was an issue with confirmation.' : 'Please check your email and click the confirmation link.'}
                    </p>
                </div>

                <div className="confirm-signup-content">
                    {error && (
                        <div className="alert alert-error">
                            <div className="alert-header">
                                <svg className="alert-icon alert-icon-error" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="alert-content">
                                    <h3>Confirmation Error</h3>
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <div className="alert-header">
                                <svg className="alert-icon alert-icon-success" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div className="alert-content">
                                    <h3>Email Confirmed!</h3>
                                    <p>Your email has been successfully confirmed. Redirecting you to sign in...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!success && !error && (
                        <div>
                            <div className="confirmation-section">
                                <svg className="confirmation-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="confirmation-text">
                                    Please check your email and click the confirmation link we sent you.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="confirm-footer">
                        <p>
                            Having trouble?{' '}
                            <a href="/signin">
                                Go back to sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
