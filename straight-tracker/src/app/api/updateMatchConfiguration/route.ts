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
            enableSets,
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

        const { data: existingSets, error: setsCheckError } = await supabase
            .from('pool_matches_sets')
            .select('match_id')
            .eq('match_id', matchID);

        if (setsCheckError) {
            return NextResponse.json({ error: 'Failed to check existing sets' }, { status: 500 });
        }

        const wasSetsEnabled = existingSets && existingSets.length > 0;

        const { data: allRaces, error: fetchRacesError } = await supabase
            .from('pool_matches_race')
            .select('player1_score, player2_score')
            .eq('match_id', matchID);

        if (fetchRacesError) {
            return NextResponse.json({ error: 'Failed to fetch set scores' }, { status: 500 });
        }

        let totalP1 = 0;
        let totalP2 = 0;

        allRaces?.forEach(race => {
            totalP1 += race.player1_score ?? 0;
            totalP2 += race.player2_score ?? 0;
        });

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

        // No sets -> Enable sets
        if (!wasSetsEnabled && enableSets) {
            const { error: insertError } = await supabase
                .from('pool_matches_sets')
                .insert({
                    match_id: matchID,
                    sets: parseInt(sets),
                });

            if (insertError) {
                return NextResponse.json({ error: 'Failed to create sets entry' }, { status: 500 });
            }
        }

        // Enable Sets -> No sets
        else if (wasSetsEnabled && !enableSets) {
            await supabase
                .from('pool_matches_sets')
                .delete()
                .eq('match_id', matchID);

            await supabase
                .from('pool_matches_race')
                .delete()
                .eq('match_id', matchID);
            
            const { error: insertRaceError } = await supabase
                .from('pool_matches_race')
                .insert({
                    match_id: matchID,
                    player1_score: totalP1,
                    player2_score: totalP2,
                });

            if (insertRaceError) {
                return NextResponse.json({ error: 'Failed to insert new combined race' }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Match format updated successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
