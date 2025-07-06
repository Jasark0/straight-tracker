import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const { matchID, player1Score, player2Score, player1Set, player2Set } = body;

        if (!matchID || player1Score == null || player2Score == null){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
        .from('pool_matches')
        .update({ player1Score, player2Score })
        .eq('match_id', matchID);

        if (player1Set && player2Set){
            const { error } = await supabase
            .from('matches_sets')
            .update({ player1Set, player2Set })
            .eq('match_id', matchID);
        }

        if (error){
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Match updated successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
