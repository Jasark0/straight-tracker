import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token || !type) {
        return NextResponse.redirect(new URL('/confirm-signup?error=Invalid confirmation link', request.url));
    }

    try {
        const supabase = await createClient();
        
        if (type === 'signup') {
            const { error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'email',
            });

            if (error) {
                console.error('Email confirmation error:', error);
                return NextResponse.redirect(new URL(`/confirm-signup?error=${encodeURIComponent(error.message)}`, request.url));
            }

            return NextResponse.redirect(new URL('/?message=verification_confirmed', request.url));
        } else {
            return NextResponse.redirect(new URL('/confirm-signup?error=Unsupported confirmation type', request.url));
        }
    } catch (error: any) {
        console.error('Confirmation error:', error);
        return NextResponse.redirect(new URL(`/confirm-signup?error=${encodeURIComponent(error.message || 'An error occurred during confirmation')}`, request.url));
    }
}
