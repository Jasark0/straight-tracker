import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email query param is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const available = !data;

    return NextResponse.json({ available });
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
