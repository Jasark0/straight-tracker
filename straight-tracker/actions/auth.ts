"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { NextResponse, userAgent } from "next/server";
import { create } from "domain";

export async function getUserSession() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if( error) {
        return null;
    }

    return { status: "success", user: data?.user };
}

export async function signUp(formData : FormData) {
    const supabase = await createClient();

    const credentials = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    // Password validation
    if(credentials.password !== credentials.confirmPassword) {
        return { status: "Passwords do not match." };
    }

    const {error, data} = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
            data: {
                username: credentials.username,
                display_name: credentials.username,
            },
        }
    });

    const {data: existingUser} = await supabase
    .from("profiles")
    .insert([{
        id: data.user?.id,
        email: credentials.email,
        username: credentials.username,
        created_at: new Date().toISOString(),
    }])
    .select();

    if (error) {
        return {
            status: error?.message,
            user: null
        };
    } else if (data?.user?.identities?.length === 0) {
        return {
            status: "User with this email already exists. Please sign in instead.",
            user: null,
        };
    }

    revalidatePath("/", "layout");
    return {status: "success", user: data.user};
}

export async function signIn(formData : FormData) {
    const supabase = await createClient();
    const {identifier, password} = {
        identifier: formData.get("identifier") as string,
        password: formData.get("password") as string,
    }

    
    let email = identifier;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if ( !isEmail) {
        const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();

        if ( profileError || !profile) {
            return  {
                status: "Username not found.",
            };
        }

        email = profile.email;
    }

    const {error, data} = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return {
            status: error?.message,
            user: null,
        }
    }

    revalidatePath("/", "layout");
    return {status: "success", user: data.user};
}

export async function signOut() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error signing out:", error);
        // Optionally redirect to an error page
        return redirect("/error");
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signInWithGoogle() {
    const origin = (await headers()).get("origin");
    const supabase = await createClient();

    const {data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`
        },
    });

    if (error) {
        return {error: 'Could not authenticate user'};
    } else if (data.url) {
        redirect(data.url);
    }
}

export async function forgotPassword(formData: FormData) {
    const origin = (await headers()).get("origin");
    const supabase = await createClient();
    
    const { error} = await supabase.auth.resetPasswordForEmail(
        formData.get("email") as string,
        {
            redirectTo: `${origin}/resetpassword`,
        }
    );

    if ( error) {
        return {status: error?.message};
    }

    return { status: "success"};
}

export async function resetPassword( formData: FormData, code: string ) {
    const supabase = await createClient();

    const {error: CodeError} = await supabase.auth.exchangeCodeForSession(code);

    if ( CodeError) {
        return {status: CodeError?.message } ;
    }

    const { error } = await supabase.auth.updateUser({
        password: formData.get("password") as string,
    });

    if ( error) {
        return { status: error?.message };
    }

    return { status: "success"};
}