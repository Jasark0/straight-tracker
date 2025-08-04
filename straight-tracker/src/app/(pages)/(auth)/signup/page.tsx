"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { signInWithGoogle, signUp } from '@/actions/auth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactiveButton from 'reactive-button';

const Signup: React.FC = () => {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        nickname: '',
        password: '',
        confirmPassword: ''
    });
    const [usernameAvailable, setUsernameAvailable] = useState <boolean|null>(null);
    const [emailAvailable, setEmailAvailable] = useState <boolean|null>(null);
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
        }, 2000); 
    }

    const handleSubmit = async (formData: FormData) => {
        setError(null);

        if (abortControllerRef.current?.signal.aborted) {
            return;
        }
        
        try {
            const result = await signUp(formData); 

            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            if (result.status === "success") {
                setState('success');
                setTimeout(() => {
                    if (!abortControllerRef.current?.signal.aborted) {
                        toast.success("Email verification sent! Please check your email and click the verification link to activate your account.");
                        resetStates();
                    }
                }, 1000);
            } else {
                onError(`${result.status}`);
            }
        } catch (error) {
            if (!abortControllerRef.current?.signal.aborted) {
                onError("An error occurred during signup.");
            }
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prevFormData => {
            return {
                ...prevFormData,
                [event.target.name]: event.target.value
            };
        });
    };

    useEffect(() => {
        const username = formData.username;

        if (!username) {
            setUsernameAvailable(null);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const res = await fetch(`/api/usernameExists?username=${encodeURIComponent(username)}`);
                const json = await res.json();
                setUsernameAvailable(json.available);
            } catch {
                setUsernameAvailable(null);
            } 
        }, 300);

        return () => clearTimeout(handler);
    }, [formData.username]);

    useEffect(() => {
        const email = formData.email;

        if (!email) {
            setUsernameAvailable(null);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const res = await fetch(`/api/emailExists?email=${encodeURIComponent(email)}`);
                const json = await res.json();
                setEmailAvailable(json.available);
            } catch {
                setEmailAvailable(null);
            } 
        }, 300);

        return () => clearTimeout(handler);
    }, [formData.email]);

    const signInPage = () => {
        router.push('/signin');
    }

    if (state === 'error') {
        reactiveButtonColor = 'red';
    } else if (state === 'success') {
        reactiveButtonColor = 'green';
    } else if (state === 'loading') {
        reactiveButtonColor = 'blue';
    } else if (state === 'idle') {
        reactiveButtonColor = 'blue';
    }

    return (
        <div className="signup-page-container">
            <ToastContainer className="signin-toast"/>
            <div className="signup-container">
                <p className="signup-title-text">Create an Account</p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    onClickHandler(() => handleSubmit(formData));
                }}>
                    <div className="signup-form-group">
                        <label>Username</label>
                        <input type="text" 
                        placeholder="Your username" 
                        required 
                        pattern="^[A-Za-z0-9_]{3,}$"
                        title="Username must be at least 3 characters and can only contain letters, numbers, and underscores. No spaces."
                        name="username"
                        onChange={handleChange}
                    />
                    </div>

                    {usernameAvailable === false && <p className="signup-username-taken-text">Username is taken.</p>}

                    <div className="signup-form-group">
                        <label>Email</label>
                        <input 
                        type="email" 
                        placeholder="Email address" 
                        required 
                        name="email"
                        onChange={handleChange}
                        />
                    </div>

                    {emailAvailable === false && <p className="signup-email-taken-text">Email is used.</p>}

                    <div className="signup-form-group">
                        <label>Nickname</label>
                        <input type="text" 
                        placeholder="Your nickname (Optional)" 
                        pattern="^[A-Za-z0-9_]{3,}$"
                        title="Nickname must be at least 3 characters and can only contain letters, numbers, and underscores. No spaces."
                        name="nickname"
                        onChange={handleChange}
                    />
                    </div>

                    <div className="signup-form-group">
                        <label>Password</label>
                        <input 
                        type="password" 
                        placeholder="Password" 
                        name="password"
                        onChange={handleChange}
                        />
                    </div>

                    <div className="signup-form-group">
                        <label>Confirm Password</label>
                        <input 
                        type="password" 
                        placeholder="Enter your password again" 
                        required
                        minLength={8}
                        name="confirmPassword"
                        title="Password must be at least 8 characters."
                        onChange={handleChange}
                        />
                    </div>

                    {error && <p className={`signup-error-message ${errorAnimationClass}`}>{error}</p>}

                    <ReactiveButton 
                        type="submit"
                        idleText="Sign Up"
                        loadingText="Signing Up..."
                        successText="Success!"
                        errorText="Error"
                        buttonState={state}
                        rounded={true}
                        shadow={true}
                        width={"100%"}
                        size='large'
                        color={reactiveButtonColor}
                        className="signup-button"
                    />
                </form>

                <p className="signup-already-text" onClick={signInPage}>Already have an account?</p>
                <p className="signup-or-text">or</p>

                <img src="google.png" className="signup-google-icon" onClick={signInWithGoogle}></img>
            </div>
        </div>
    )
}

export default Signup