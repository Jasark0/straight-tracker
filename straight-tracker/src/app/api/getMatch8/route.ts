import { NextResponse } from 'next/server';
import { supabase } from '../../../client';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const match_id = searchParams.get('matchID');
    const email = searchParams.get('email'); 

    if (!match_id || !email) {
        return NextResponse.json({ error: 'Missing matchID or email' }, { status: 400 });
    }

    // Get username from email
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const username = profile.username;

    // Get match and ensure it belongs to user
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('match_id', match_id)
        .eq('username', username)
        .single();

    if (matchError || !match) {
        return NextResponse.json({ error: 'Unauthorized or match not found' }, { status: 403 });
    }

    return NextResponse.json({ match }, { status: 200 });
}
