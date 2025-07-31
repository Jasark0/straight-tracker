import { NextResponse } from 'next/server';
import { supabase } from '../../../client';
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

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }


    const username = profile.username;

    const { data: straightMatch, error: matchError } = await supabase
        .from('straight_pool_matches')
        .select(`
            game_name, 
            player1, 
            player2,
            race_to,
            to_shoot,
            lag_winner,
            rack,
            remaining_balls,
            player1_score,
            player1_high_run,
            player1_curr_run,
            player2_score,
            player2_high_run,
            player2_curr_run
            `)
        .eq('match_id', match_id)
        .eq('username', username)
        .single();

    if (matchError || !straightMatch) {
        return NextResponse.json({ redirect: '/history' }, { status: 403 });
    }

    return NextResponse.json({ straightMatch }, { status: 200 });
}
