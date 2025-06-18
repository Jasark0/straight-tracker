import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // This is Step 1 from the Supabase docs:
  // https://supabase.com/docs/guides/auth/social-login/auth-google#sign-in-with-oauth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // This is the URL where Google will redirect the user back to after they sign in.
      // It MUST point to your callback API route.
      redirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')}/api/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({ error: 'Could not authenticate user' }, { status: 500 });
  }

  // The API route returns the URL that the client will redirect to.
  return NextResponse.json({ url: data.url });
}