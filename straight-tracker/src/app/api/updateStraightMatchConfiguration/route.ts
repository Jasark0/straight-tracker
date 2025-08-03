import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { getUserSession } from '@/actions/auth';

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
            lag_winner,
            to_shoot
        } = body;
    
        const session = await getUserSession();
        const user = session?.user;
    
        const email = user?.email;
    
        // const { data: profile, error: profileError } = await supabaseAdmin
        //     .from('profiles')
        //     .select('username')
        //     .eq('email', email)
        //     .single();
    
        // if (profileError || !profile) {
        //     return NextResponse.json({ error: 'User not found' }, { status: 404 });
        // }
    
        // const username = profile.username;

        const { data: matchData, error: matchError } = await supabaseAdmin
        .from('straight_pool_matches')
        .update([
            {
                game_name: game_name,
                player1: player1,
                player2: player2,
                race_to: parseInt(race_to),
                lag_winner: lag_winner,
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
