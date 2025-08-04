"use client";

import { useRouter } from 'next/navigation'
import React, { useState, useRef } from 'react'
import { resendVerificationEmail, signIn, signInWithGoogle } from '@/actions/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactiveButton from 'reactive-button';


const Signin: React.FC = () => {
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [state, setState] = useState('idle');
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [errorAnimationClass, setErrorAnimationClass] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    
    let reactiveButtonColor = 'blue';

    const resetStates = () => {
        setState('idle');
        setError(null);
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }

    const onClickHandler = (callback: () => void) => {
        setState('loading');
        
        abortControllerRef.current = new AbortController();
        
        timeoutRef.current = setTimeout(() => { 
            if (!abortControllerRef.current?.signal.aborted) {
                callback();
            }
        }, 2000); 
    }

    const onError = (errorMessage: string) => {
        setState('error');
        setError(errorMessage);
        
        setErrorAnimationClass('entering');
        setIsErrorVisible(true);
        
        setTimeout(() => {
            setErrorAnimationClass('visible bounce-in');
        }, 50);
        
        setTimeout(() => {
            setErrorAnimationClass('exiting');
            
            setTimeout(() => {
                setError(null);
                setIsErrorVisible(false);
                setErrorAnimationClass('');
                resetStates();
            }, 400); 
        }, 2500); 
    }

    const handleSubmit = async (formData: FormData) => {
        setError(null);

        if (abortControllerRef.current?.signal.aborted) {
            return;
        }

        try {
            const result = await signIn(formData);

            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            if (result.status === "success") {
                setState('success');
                setTimeout(() => {
                    if (!abortControllerRef.current?.signal.aborted) {
                        router.push("/");
                    }
                }, 1000);
            } else if (result.status === "Email not confirmed"){
                const resultt = await resendVerificationEmail(formData.get("identifier") as string);
                if ( resultt.status === "success") {
                    onError("Email not confirmed. A new verification email has been sent to your inbox.");
                }
                else
                {
                    onError(resultt.status);
                }
            } else {
                onError(result.status);
            }
        } catch (error) {
            if (!abortControllerRef.current?.signal.aborted) {
                onError("An error occurred during signin.");
            }
        }
    }

    const signUpPage = () => {
        router.push('/signup');
    }

    const forgotPasswordPage = () => {
        router.push('/forgotpassword');
    }

    if (state === 'error') {
        reactiveButtonColor ='red';
    } else if (state === 'success') {
        reactiveButtonColor ='green';
    }
    else if (state === 'loading') {
        reactiveButtonColor ='blue';
    }
    else if (state === 'idle') {
        reactiveButtonColor ='blue';
    }

    return (
        <div className="signin-page-container">
            <ToastContainer className="signin-toast" />
            <div className="signin-container">
                <p className="signin-title-text">Sign in to Straight Tracker</p>

                <form>
                    <div className="signin-form-group">
                        <label>Username/Email</label>
                        <input
                            type="text"
                            placeholder="Your email"
                            required
                            name="identifier"
                        />
                    </div>
                    <div className="signin-form-group">
                        <label>Password</label>
                        <input 
                        type="password" 
                        placeholder="Password" 
                        name="password"
                        required />
                    </div>
                    {error && <p className={`signin-error-message ${errorAnimationClass}`}>{error}</p>}

                    <ReactiveButton 
                        idleText="Sign In"
                        loadingText="Signing In..."
                        successText="Success!"
                        errorText="Error"
                        buttonState={state}
                        rounded={true}
                        shadow={true}
                        width={"100%"}
                        size='large'
                        color={reactiveButtonColor}
                        className="signin-button"
                        onClick={() => onClickHandler(async () => {
                            const form = document.querySelector('form') as HTMLFormElement;
                            if (form) {
                                const formData = new FormData(form);
                                await handleSubmit(formData);
                            }
                        })}
                    />
                </form>

                <p className="signin-dont-text" onClick={signUpPage}>Don't have an account? Sign up here.</p>
                <p className="signin-forgot-text" onClick={forgotPasswordPage}>Forgot your Password?</p>
                <p className="signin-or-text">or</p>

                <img src="google.png" className="signin-google-icon" onClick={signInWithGoogle}></img>
            </div>
        </div>
    )
}

export default Signin