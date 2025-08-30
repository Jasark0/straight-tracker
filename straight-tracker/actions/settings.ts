"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { headers } from "next/headers";
import { getUserSession } from "./auth";

export async function getProfileVisibility() {
    const session = await getUserSession();

    if (!session) {
        return { status: "Session not found." };
    }

    const userId = session.user?.id;

    const { data: user, error: userError } = await supabaseAdmin
        .from('profile_settings')
        .select('visibility')
        .eq('id', userId)
        .single();

    if ( userError)
    {
        console.error("getProfileVisibility Error: ", userError);
        return { status: "error", message: "getProfileVisibility Error: " + userError.message };
    }

    return { status: "success", visibility: user?.visibility };
}

export async function getUserProfileVisibility(username: string)
{
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

    if (error) {
        console.error("getUserProfileVisibility Error: ", error);
        return { status: "error", message: "getUserProfileVisibility Error: " + error.message };
    }
    
    const userId = data?.id;
    
    const {data: user, error: profileSettingsError } = await supabaseAdmin
        .from('profile_settings')
        .select('visibility')
        .eq('id', userId)
        .single();
    
    if (profileSettingsError)
    {
        console.error("getUserProfileVisibility Error: ", profileSettingsError);
        return { status: "error", message: "getUserProfileVisibility Error: " + profileSettingsError.message };
    }

    return { status: "success", visibility: user?.visibility };
}



export async function changeProfileVisibility(visibility: 'Public' | 'Private' | 'Friends Only') {
    const session = await getUserSession();

    if (!session) {
        return { status: "Session not found." };
    }

    const userId = session.user?.id;

    const { data, error } = await supabaseAdmin
        .from('profile_settings')
        .update({ visibility })
        .eq('id', userId);

    if (error) {
        return { status: "error", message: "changeProfileVisibility Error: " + error.message };
    }

    return { status: "success" };
}

