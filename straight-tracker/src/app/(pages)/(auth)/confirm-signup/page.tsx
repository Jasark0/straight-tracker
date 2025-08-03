'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function ConfirmSignupPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
    
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const urlParam = searchParams.get('confirmation_url');
        if (urlParam) {
            const decodedUrl = decodeURIComponent(urlParam);
            setConfirmationUrl(decodedUrl);
            performConfirmation(decodedUrl);
        } else {
            setError('No confirmation URL found. Please check your email link.');
        }
    }, [searchParams]);

    const performConfirmation = async (confirmationUrl: string) => {
        if (!confirmationUrl) {
            setError('No confirmation URL available.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = new URL(confirmationUrl);
            const token = url.searchParams.get('token');
            const type = url.searchParams.get('type');

            if (!token || !type) {
                throw new Error('Invalid confirmation link');
            }

            const supabase = createClient();
            
            if (type === 'signup') {
                const { error } = await supabase.auth.verifyOtp({
                    token_hash: token,
                    type: 'email'
                });

                if (error) {
                    throw error;
                }
            } else {
                window.location.href = confirmationUrl;
                return;
            }

            setSuccess(true);
        
            setTimeout(() => {
                router.push('/signin?message=Email confirmed successfully! You can now sign in.');
            }, 2000);

        } catch (err: any) {
            console.error('Confirmation error:', err);
            setError(err.message || 'An error occurred during confirmation');
        } finally {
            setLoading(false);
        }
    };

    const handleManualConfirmation = async () => {
        if (confirmationUrl) {
            await performConfirmation(confirmationUrl);
        }
    };

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
                        Confirm Your Email
                    </h2>
                    <p className="confirm-signup-subtitle">
                        Click the button below to confirm your email address and activate your account.
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

                    {!success && !error && confirmationUrl && (
                        <div>
                            <div className="confirmation-section">
                                <svg className="confirmation-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="confirmation-text">
                                    We've received your confirmation request. Click the button below to complete the process.
                                </p>
                            </div>

                            <button
                                onClick={handleManualConfirmation}
                                disabled={loading}
                                className="confirm-button"
                            >
                                {loading ? (
                                    <>
                                        <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Confirming...
                                    </>
                                ) : (
                                    'Confirm Email Address'
                                )}
                            </button>
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
