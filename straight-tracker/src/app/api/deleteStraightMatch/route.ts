import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const matchID = searchParams.get('matchID');

        if (!matchID) {
            return NextResponse.json({ error: 'Missing matchID' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('straight_pool_matches')
            .delete()
            .eq('match_id', matchID);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Straight match deleted successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

