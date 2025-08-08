import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export async function PATCH(req: Request) {
    try{
        const { searchParams } = new URL(req.url);
        const matchID = searchParams.get('matchID');

        const body = await req.json();
        
        const {
            game_name,
            player1,
            player2,
            race_to,
            to_shoot
        } = body;
    

        const { data: matchData, error: matchError } = await supabaseAdmin
        .from('straight_pool_matches')
        .update([
            {
                game_name: game_name,
                player1: player1,
                player2: player2,
                race_to: parseInt(race_to),
                to_shoot: to_shoot,
                winner: null,
            },
        ])
        .eq('match_id', matchID)
        .select(); 
        
        if (matchError || !matchData || matchData.length === 0) {
            return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Match format updated successfully' }, { status: 200 });
    } 
    catch (error){
       if (error instanceof ValidationError) {
            return NextResponse.json({ type: 'validation_error', error: error.message }, { status: 400 });
        }

        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
