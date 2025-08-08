import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { getUserSession } from '@/actions/auth';

export async function GET(req: Request) {
    const session = await getUserSession();
    const id = session?.user.id;

    
    const { data: filteredGameType, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('filtered_game_type')
        .eq('id', id)
        .single();

    
    if (profileError || !filteredGameType) {
        return NextResponse.json({ error: 'User or filtered game type not found' }, { status: 404 });
    }

    return NextResponse.json( filteredGameType, { status: 200 });
}
