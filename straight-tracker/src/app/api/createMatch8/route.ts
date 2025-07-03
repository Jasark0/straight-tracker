import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function POST(req: Request) {
    const body = await req.json();

    const {
        email,
        gameName,
        player1,
        player2,
        raceTo,
        sets,
        breakFormat,
        lagWinner,
    } = body;

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username')
        .eq('email', email)
        .single();

    if (profileError || !profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const username = profile.username;

    let finalGameName = gameName;
    
    if (!finalGameName) {
        const { count, error: countError } = await supabase
        .from('matches')
        .select('match_id', { count: 'exact' })
        .eq('username', username)
        .eq('game_type', 0);

        if (countError) {
            return NextResponse.json({ error: 'Failed to count 8 Ball matches' }, { status: 500 });
        }

        let safeCount = 0;
        if (count !== null){
            safeCount = count;
        }
        finalGameName = `8 Ball - Match ${safeCount + 1}`;
    }

    const { data: matchData, error: matchError } = await supabase
    .from('matches')
    .insert([
        {
            username,
            game_type: 0,
            game_name: finalGameName,
        },
    ])
    .select(); 

    if (matchError || !matchData || matchData.length === 0) {
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }

    const finalPlayer1 = player1?.trim() ? player1 : "Player1";
    const finalPlayer2 = player2?.trim() ? player2 : "Player2";


    const match_id = matchData[0].match_id;
    const breakFormatInt = breakFormat === "Winner Breaks" ? 0 : breakFormat === "Alternate Breaks" ? 1 : null;
    const selectedLagWinner = lagWinner?.trim() ? lagWinner : (Math.random() < 0.5 ? finalPlayer1 : finalPlayer2);

    if (breakFormatInt === null) {
        return NextResponse.json({ error: 'Invalid break format' }, { status: 400 });
    }
    
    const { error: poolError } = await supabase
    .from('pool_matches')
    .insert([
        {
            match_id,
            player1: finalPlayer1,
            player2: finalPlayer2,
            race_to: parseInt(raceTo),
            sets: parseInt(sets),
            break_format: breakFormatInt,
            lag_winner: selectedLagWinner,
            winner: null,
            to_break: finalPlayer1,
        },
    ]);

    if (poolError) {
        console.error('Pool match insert error:', poolError);
        return NextResponse.json({ error: 'Failed to create pool match' }, { status: 500 });
    }

    return NextResponse.json({ success: true, match_id }, { status: 200 });
}
