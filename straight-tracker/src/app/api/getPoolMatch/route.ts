import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { getUserSession } from '@/actions/auth';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const match_id = searchParams.get('matchID');

    if (!match_id) {
        return NextResponse.json({ error: 'Missing match ID' }, { status: 400 });
    }

    const session = await getUserSession();
    const user = session?.user;
    const email = user?.email;

    
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    const username = profile.username;

    const { data: poolMatch, error: matchError } = await supabaseAdmin
        .from('pool_matches')
        .select('*')
        .eq('match_id', match_id)
        .eq('username', username)
        .single();

    if (matchError || !poolMatch || poolMatch.winner != null) {
        return NextResponse.json({ redirect: '/history' }, { status: 403 });
    }

    const { data: matchRace, error: matchRaceError } = await supabaseAdmin
        .from('pool_matches_race')
        .select('*')
        .eq('match_id', match_id)
        .order('id', { ascending: true })


    if (matchRaceError) {
        return NextResponse.json({ error: 'Error retrieving pool race data' }, { status: 500 });
    }

    const { data: matchSets, error: matchSetsError } = await supabaseAdmin
        .from('pool_matches_sets')
        .select('*')
        .eq('match_id', match_id)
        .maybeSingle();
    
    if (matchSetsError) {
        return NextResponse.json({ error: 'Error retrieving pool sets data' }, { status: 500 });
    } 

    return NextResponse.json({ poolMatch, matchRace, matchSets }, { status: 200 });
}
