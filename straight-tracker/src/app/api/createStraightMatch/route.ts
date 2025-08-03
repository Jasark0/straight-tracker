import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { getUserSession } from '@/actions/auth';

export async function POST(req: Request) {
    const body = await req.json();

    const {
        game_name,
        player1,
        player2,
        race_to,
        lag_winner,
    } = body;

    const session = await getUserSession();
    const user = session?.user;

    const email = user?.email;

    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user_id = profile.id;

    let finalGameName = game_name;
    
    if (!finalGameName) {
        const { count, error: countError } = await supabaseAdmin
        .from('straight_pool_matches')
        .select('match_id', { count: 'exact' })
        .eq('user_id', user_id)

        if (countError) {
            return NextResponse.json({ error: 'Failed to count straight pool matches' }, { status: 500 });
        }

        let safeCount = 0;
        if (count !== null){
            safeCount = count;
        }
        finalGameName = `Straight Pool - Match ${safeCount + 1}`;
    }

    const finalPlayer1 = player1?.trim() ? player1 : "Player1";
    const finalPlayer2 = player2?.trim() ? player2 : "Player2";
    const selectedLagWinner = lag_winner?.trim() ? lag_winner : (Math.random() < 0.5 ? finalPlayer1 : finalPlayer2);
    
    const { data: matchData, error: matchError } = await supabaseAdmin
    .from('straight_pool_matches')
    .insert([
        {
            user_id,
            game_name: finalGameName,
            player1: finalPlayer1,
            player2: finalPlayer2,
            race_to: parseInt(race_to),
            lag_winner: selectedLagWinner,
            to_shoot: selectedLagWinner,
            rack: 1,
            remaining_balls: 15,
            player1_score: 0,
            player1_high_run: 0,
            player1_curr_run: 0,
            player2_score: 0,
            player2_high_run: 0,
            player2_curr_run: 0,
            winner: null,
        },
    ])
    .select(); 

    if (matchError || !matchData || matchData.length === 0) {
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }

    const match_id = matchData[0].match_id;

    return NextResponse.json({ success: true, match_id }, { status: 200 });
}
