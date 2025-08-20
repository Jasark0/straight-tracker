import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { getUserSession } from '@/actions/auth';

export async function POST(req: Request) {
    const body = await req.json();

    const {
        game_type,
        game_name,
        player1,
        player2,
        race_to,
        break_format,
        lag_winner,
        sets,
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
    
    if (!finalGameName){
        finalGameName = `${game_type} Ball - Match`;
    }


    const finalPlayer1 = player1?.trim() ? player1 : "Player1";
    const finalPlayer2 = player2?.trim() ? player2 : "Player2";

    const lagChosen = !!lag_winner;
    const finalLagWinner = lag_winner || (Math.random() < 0.5 ? 1 : 2);

    const { data: matchData, error: matchError } = await supabaseAdmin
    .from('pool_matches')
    .insert([
        {
            user_id,
            game_type: game_type,
            game_name: finalGameName,
            player1: finalPlayer1,
            player2: finalPlayer2,
            race_to: parseInt(race_to),
            break_format,
            to_break: finalLagWinner,
            winner: null,
        },
    ])
    .select(); 

    if (matchError || !matchData || matchData.length === 0) {
        console.log(matchError);
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }

    const match_id = matchData[0].match_id;

    if (lagChosen) {
        const { error: lagError } = await supabaseAdmin
            .from('pool_matches_lag')
            .insert([
                {
                    match_id,
                    lag_winner
                },
            ]);

        if (lagError) {
            console.error('Lag insert error:', lagError);
        }
    }
    
    const { error: raceError } = await supabaseAdmin
    .from('pool_matches_race')
    .insert([
        {
            match_id,
            player1_score: 0,
            player2_score: 0,
        },
    ]);

    if (raceError) {
        console.error('Pool match race insert error:', raceError);
        return NextResponse.json({ error: 'Failed to create pool match race' }, { status: 500 });
    }


    if (sets){
        const { error: setsError } = await supabaseAdmin
        .from('pool_matches_sets')
        .insert([
            {
                match_id,
                sets: parseInt(sets),
            },
        ]);

        if (setsError) {
            console.error('Sets insert error:', setsError);
            return NextResponse.json({ error: 'Failed to create sets entry' }, { status: 500 });
        }
    }

    return NextResponse.json({ success: true, match_id }, { status: 200 });
}
