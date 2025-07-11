import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const raceID = searchParams.get('raceID');

        if (!raceID) {
            return NextResponse.json({ error: 'Missing raceID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('pool_matches_race')
            .delete()
            .eq('id', raceID);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Race deleted successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

