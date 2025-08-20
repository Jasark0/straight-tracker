import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const { match_id, id, player1_score, player2_score, to_break, winner } = body;

        if (!match_id || !id || player1_score === null || player2_score === null || to_break === null){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error: breakError } = await supabaseAdmin
        .from('pool_matches')
        .update({
            to_break,
            continued_at: new Date().toISOString()
        })
        .eq('match_id', match_id)

        if (breakError){
            return NextResponse.json({ error: breakError.message }, { status: 500 });
        }

        const updateData: any = {
            player1_score,
            player2_score,
        };

        if (winner !== undefined){
            updateData.winner = winner;
        }

        const { error } = await supabaseAdmin
        .from('pool_matches_race')
        .update(updateData)
        .eq('id', id);

        if (error){
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Race updated successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
