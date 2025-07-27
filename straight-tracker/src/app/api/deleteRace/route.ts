import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const raceID = searchParams.get('raceID');

        if (!raceID) {
            return NextResponse.json({ error: 'Missing raceID' }, { status: 400 });
        }

        const { data: raceData, error: fetchError } = await supabase
            .from('pool_matches_race')
            .select('match_id')
            .eq('id', raceID)
            .single();

        if (fetchError || !raceData) {
            return NextResponse.json({ error: 'Race not found' }, { status: 404 });
        }

        const matchId = raceData.match_id;

        const { error: deleteError } = await supabase
            .from('pool_matches_race')
            .delete()
            .eq('id', raceID);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        const { data: latestRace } = await supabase
            .from('pool_matches_race')
            .select('id')
            .eq('match_id', matchId)
            .order('id', { ascending: false })
            .limit(1)
            .single();

        if (latestRace){
            await supabase
                .from('pool_matches_race')
                .update({ winner: null })
                .eq('id', latestRace.id);
        }

        return NextResponse.json({ message: 'Race deleted and previous race updated' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

