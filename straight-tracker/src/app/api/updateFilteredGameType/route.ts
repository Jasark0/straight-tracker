import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { getUserSession } from '@/actions/auth';

export async function POST(req: Request) {
    try{
        const session = await getUserSession();
        const id = (session?.user.id);

        const body = await req.json();
        const { filtered_game_type } = body;

        if (!id || filtered_game_type === null){
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({filtered_game_type})
        .eq('id', id)

        if (profileError){
            return NextResponse.json({ profileError }, { status: 500 });
        }

        return NextResponse.json({ message: 'Filtered game type updated successfully' }, { status: 200 });
    } 
    catch (error){
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
