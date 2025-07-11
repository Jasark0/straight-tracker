import { NextResponse } from 'next/server';
import { supabase } from '../../../client';

export async function GET(req: Request) {
  try{
    const { searchParams } = new URL(req.url);
    const raceID = searchParams.get('raceID');

    if (!raceID) {
      return NextResponse.json({ error: 'Missing raceID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('pool_matches_race')
      .select('player1_score, player2_score')
      .eq('id', raceID)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ player1Score: data.player1_score, player2Score: data.player2_score });
  } 
  catch (err){
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
