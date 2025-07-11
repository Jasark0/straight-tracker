import { NextResponse } from 'next/server';
import { supabase } from '../../../client'
import { getUserSession } from '@/actions/auth';

export async function POST(req: Request) {
    try{
        const { searchParams } = new URL(req.url);
        const match_id = searchParams.get('matchID');

        if (!match_id){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        const { data: newRace, error } = await supabase
        .from('pool_matches_race')
        .insert([
            {
                match_id,
                player1_score: 0,
                player2_score: 0,
            },
        ])
        .select();

        if (error){
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Race updated successfully', newRace }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

