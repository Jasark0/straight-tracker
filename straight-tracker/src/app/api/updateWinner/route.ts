import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const { matchID, winner } = body;

        if (!matchID || winner == null){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
        .from('pool_matches')
        .update({ winner })
        .eq('match_id', matchID);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Winner updated successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
