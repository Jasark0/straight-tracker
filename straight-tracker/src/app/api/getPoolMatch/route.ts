import { NextResponse } from 'next/server';
import { supabase } from '../../../client';
import { getUserSession } from '@/actions/auth';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const game_type = searchParams.get('gameType');
    const match_id = searchParams.get('matchID');

    if (!game_type || !match_id) {
        return NextResponse.json({ error: 'Missing game type/match ID' }, { status: 400 });
    }

    let finalGameType;

    switch (parseInt(game_type)){
        case 8:
            finalGameType = 0;
            break;
        case 9:
            finalGameType = 1;
            break;
        case 10:
            finalGameType = 2;
            break;
    }

    const session = await getUserSession();
    const user = session?.user;
    const email = user?.email;
    
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    const username = profile.username;

    const { data: poolMatch, error: matchError } = await supabase
        .from('pool_matches')
        .select('*')
        .eq('match_id', match_id)
        .eq('username', username)
        .single();

    if (matchError || !poolMatch || poolMatch.winner != null || poolMatch.game_type != finalGameType) {
        return NextResponse.json({ redirect: '/history' });
    }

    const { data: matchRace, error: matchRaceError } = await supabase
        .from('pool_matches_race')
        .select('*')
        .eq('match_id', match_id)
        .order('id', { ascending: true })


    if (matchRaceError) {
        return NextResponse.json({ error: 'Error retrieving pool race data' }, { status: 500 });
    }

    const { data: matchSets, error: matchSetsError } = await supabase
        .from('pool_matches_sets')
        .select('*')
        .eq('match_id', match_id)
        .maybeSingle();
    
    if (matchSetsError) {
        return NextResponse.json({ error: 'Error retrieving pool sets data' }, { status: 500 });
    } 

    return NextResponse.json({ poolMatch, matchRace, matchSets }, { status: 200 });
}
