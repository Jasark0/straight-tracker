"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
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
    const origin = (await headers()).get("origin");

    const credentials = {
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        nickname: formData.get("nickname") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
    };

    if(credentials.password !== credentials.confirmPassword) {
        return { status: "Passwords do not match." };
    }

    const {error, data} = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                username: credentials.username,
                display_name: credentials.username,
                nickname: credentials.nickname,
                avatar_url: null,
            },
        }
    });

    const {data: existingUser} = await supabaseAdmin
    .from("profiles")
    .insert([{
        id: data.user?.id,
        email: credentials.email,
        username: credentials.username,
        nickname: credentials.nickname,
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
        const { data: profile, error: profileError } = await supabaseAdmin
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
    }
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

export async function changePassword(formData: FormData) {
    const origin = (await headers()).get("origin");
    const supabase = await createClient();
    
    const { error} = await supabase.auth.resetPasswordForEmail(
        formData.get("email") as string,
        {
            redirectTo: `${origin}/settings/changepassword`,
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

export async function changeNickname(formData: FormData) {
    const supabase = await createClient();

    const { nickname } = {
        nickname: formData.get("nickname") as string,
    };


    if (!nickname) {
        return { status: "Nickname cannot be empty." };
    }

    const { data: { user }, error } = await supabase.auth.updateUser({
        data: {
            nickname: nickname,
        },
    });

    if (error || !user) {
        return { status: error?.message || "User not found." };
    }

    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ nickname: nickname })
        .eq('id', user.id);

    if (profileError) {
        return { status: profileError.message };
    }

    revalidatePath("/", "layout");
    return { status: "success" };
}

export async function changeUsername(formData: FormData) {
    const supabase = await createClient();
    const { username } = {
        username: formData.get("username") as string,
    };

    if (!username) {
        return { status: "Username cannot be empty." };
    }

    const { data: { user }, error } = await supabase.auth.updateUser({
        data: {
            username: username,
        },
    });

    if (error || !user) {
        return { status: error?.message || "User not found." };
    }

    const { data: existingProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ username: username })
        .eq('id', user.id)
        
    revalidatePath("/", "layout");
    return { status: "success", user: user, existingProfile: existingProfile };
}

export async function updateAvatarInProfile({ avatar_url }: { avatar_url: string }) {
    const supabase = await createClient();

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
        return { status: "User not found or session expired." };
    }

    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ avatar_url: "https://bhkzaxomtzmzofjxxcmr.supabase.co/storage/v1/object/public/avatars/" + avatar_url })
        .eq('id', user.id); 

    if (profileError) {
        console.error("Error updating profile:", profileError);
        return { status: profileError.message };
    }

    const { data: updatedUser, error: userError } = await supabase.auth.updateUser({
        data: {
            avatar_url: "https://bhkzaxomtzmzofjxxcmr.supabase.co/storage/v1/object/public/avatars/" + avatar_url,
        },
    });

    if (userError) {
        console.error("Error updating user metadata:", userError);
        return { status: userError.message };
    }
    
    revalidatePath("/", "layout");
    return { status: "success", user: updatedUser };
}

export async function updateProfile() {
    const supabase = await createClient();
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
        return { status: "User not found or session expired." };
    }

    const updateData = {
        avatar_url: user.user_metadata.avatar_url,
        nickname: user.user_metadata.nickname,
        username: user.user_metadata.username,
        email: user.email,
    }
    
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

    if (profileError) {
        console.error("Error updating profile:", profileError);
        return { status: profileError.message };
    }

    if (!profile) {
        return { status: "Profile not found." };
    }

    revalidatePath("/", "layout");
    return { status: "success", profile: profile };
}