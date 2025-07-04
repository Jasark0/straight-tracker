import { NextResponse } from 'next/server';
import { supabase } from '../../../client';
import { getUserSession } from '@/actions/auth';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const match_id = searchParams.get('matchID');
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

    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('match_id', match_id)
        .eq('username', username)
        .single();

    if (matchError || !match) {
        return NextResponse.json({ redirect: '/history' }, { status: 403 });
    }

    const { data: poolMatch, error: poolMatchError } = await supabase
        .from('pool_matches')
        .select('*')
        .eq('match_id', match_id)
        .single(); 

    if (poolMatchError) {
        return NextResponse.json({ error: 'Error retrieving pool match data' }, { status: 500 });
    }

    const { data: matchSets, error: matchSetsError } = await supabase
        .from('matches_sets')
        .select('*')
        .eq('match_id', match_id)
        .single();

    return NextResponse.json({ match, poolMatch, matchSets }, { status: 200 });
}
