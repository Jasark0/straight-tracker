import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // CRITICAL: This MUST point to your backend callback route.
      redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}/api/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: 'Could not authenticate user' }, { status: 500 });
  }

  // This route returns the special URL for the client to redirect to.
  return NextResponse.json({ url: data.url });
}