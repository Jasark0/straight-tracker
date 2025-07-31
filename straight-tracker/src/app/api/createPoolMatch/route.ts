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
        .select('username')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const username = profile.username;

    let finalGameName = game_name;
    
    if (!finalGameName) {
        const { count, error: countError } = await supabaseAdmin
        .from('pool_matches')
        .select('match_id', { count: 'exact' })
        .eq('username', username)
        .eq('game_type', game_type);

        if (countError) {
            return NextResponse.json({ error: 'Failed to count matches' }, { status: 500 });
        }

        let safeCount = 0;
        if (count !== null){
            safeCount = count;
        }

        switch (game_type){
            case 0:
                finalGameName = `8 Ball - Match ${safeCount + 1}`;
                break;
            case 1:
                finalGameName = `9 Ball - Match ${safeCount + 1}`;
                break;
            case 2:
                finalGameName = `10 Ball - Match ${safeCount + 1}`;
                break;
        }
    }

    const finalPlayer1 = player1?.trim() ? player1 : "Player1";
    const finalPlayer2 = player2?.trim() ? player2 : "Player2";
    const breakFormatInt = break_format === "Winner Breaks" ? 0 : break_format === "Alternate Breaks" ? 1 : null;
    const selectedLagWinner = lag_winner?.trim() ? lag_winner : (Math.random() < 0.5 ? finalPlayer1 : finalPlayer2);

    const { data: matchData, error: matchError } = await supabaseAdmin
    .from('pool_matches')
    .insert([
        {
            username,
            game_type: game_type,
            game_name: finalGameName,
            player1: finalPlayer1,
            player2: finalPlayer2,
            race_to: parseInt(race_to),
            break_format: breakFormatInt,
            lag_winner: selectedLagWinner,
            to_break: selectedLagWinner,
            winner: null,
        },
    ])
    .select(); 

    if (matchError || !matchData || matchData.length === 0) {
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }


    const match_id = matchData[0].match_id;
    
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
