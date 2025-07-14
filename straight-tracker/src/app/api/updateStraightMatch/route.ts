import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const { match_id, player1_score, player1_high_run, player1_curr_run, player2_score, player2_high_run, player2_curr_run } = body;

        if (!match_id || player1_score == null || player1_high_run == null || player1_curr_run == null || 
            player2_score == null || player2_high_run == null || player2_curr_run == null){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
        .from('straight_pool_matches')
        .update({ player1_score, player1_high_run, player1_curr_run, player2_score, player2_high_run, player2_curr_run })
        .eq('match_id', match_id);

        if (error){
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Straight match updated successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
