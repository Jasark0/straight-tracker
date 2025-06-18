import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    // This is Step 2 from the Supabase docs:
    // https://supabase.com/docs/guides/auth/social-login/auth-google#exchange-code-for-session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // After successfully exchanging the code for a session,
  // redirect the user to their dashboard or home page.
  return NextResponse.redirect(requestUrl.origin + '/history');
}