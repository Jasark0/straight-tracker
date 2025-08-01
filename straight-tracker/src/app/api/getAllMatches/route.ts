import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { getUserSession } from '@/actions/auth';

export async function GET(req: Request) {
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

    const { data: allPoolMatches, error: matchesError } = await supabaseAdmin
        .from('pool_matches')
        .select(`
            match_id,
            game_type,
            game_name,
            player1,
            player2,
            race_to,
            lag_winner,
            winner,
            created_at,
            pool_matches_race (
                player1_score,
                player2_score,
                winner
            ),
            pool_matches_sets (
                sets
            )
        `)
        .eq('username', username)
        .order('created_at', { ascending: false });

    if (matchesError || !allPoolMatches) {
        return NextResponse.json({ redirect: '/history' }, { status: 403 });
    }

    const { data: allStraightMatches, error: straightMatchesError } = await supabaseAdmin
        .from('straight_pool_matches')
        .select(`
            match_id,
            game_name,
            player1,
            player2,
            race_to,
            player1_score,
            player1_high_run,
            player2_score,
            player2_high_run,
            winner,
            created_at
        `)
        .eq('username', username)
        .order('created_at', { ascending: false });

    return NextResponse.json({ allPoolMatches, allStraightMatches }, { status: 200 });
}
