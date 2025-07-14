import { NextResponse } from 'next/server';
import { supabase } from '../../../client';
import { getUserSession } from '@/actions/auth';

export async function PATCH(req: Request) {
    try{
        const { searchParams } = new URL(req.url);
        const matchID = searchParams.get('matchID');

        const body = await req.json();
        
        const {
            game_type,
            game_name,
            player1,
            player2,
            race_to,
            break_format,
            lag_winner,
            to_break,
            sets,
        } = body;
    
        const session = await getUserSession();
        const user = session?.user;
    
        const email = user?.email;
    
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('email', email)
            .single();
    
        if (profileError || !profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
    
        const username = profile.username;

        const { data: matchData, error: matchError } = await supabase
        .from('pool_matches')
        .update([
            {
                username: username,
                game_type: game_type,
                game_name: game_name,
                player1: player1,
                player2: player2,
                race_to: parseInt(race_to),
                break_format: break_format,
                lag_winner: lag_winner,
                to_break: to_break,
                winner: null,
            },
        ])
        .eq('match_id', matchID)
        .select(); 
        
        if (matchError || !matchData || matchData.length === 0) {
            return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
        }

        if (sets){
            const { error: setsError } = await supabase
            .from('pool_matches_sets')
            .update([
                {
                    sets: parseInt(sets),
                },
            ])
            .eq('match_id', matchID);

            if (setsError) {
                console.error('Sets insert error:', setsError);
                return NextResponse.json({ error: 'Failed to create sets entry' }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Match format updated successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
