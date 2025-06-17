import { NextResponse } from 'next/server';
import { supabase } from '../../../client'

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user?.id,
          email,
          username,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Check your email for the confirmation link.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Unexpected error occurred.' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}


