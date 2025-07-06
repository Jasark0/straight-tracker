import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const { id, player1Score, player2Score } = body;

        if (!id || player1Score == null || player2Score == null){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabase
        .from('pool_matches_race')
        .update({ player1Score, player2Score })
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
