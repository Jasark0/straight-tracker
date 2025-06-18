import { NextResponse } from 'next/server';
import { supabase } from '../../../client';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    let email = identifier;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isEmail) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: 'Username not found.' }, { status: 400 });
      }

      email = profile.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json({
      message: 'Signed in successfully.',
      user: data.user,
      session: data.session
    });
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error occurred.' }, { status: 500 });
  }
}

