import { NextResponse } from 'next/server';
import { supabase } from '../../../client';
import { getUserSession } from '@/actions/auth';

export async function GET(req: Request) {
    const session = await getUserSession();
    const user = session?.user;
    const email = user?.email;

    
    const { data: nickname, error: profileError } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('email', email)
        .single();

    if (profileError || !nickname) {
        return NextResponse.json({ error: 'User or nickname not found' }, { status: 404 });
    }

    return NextResponse.json( nickname, { status: 200 });
}
