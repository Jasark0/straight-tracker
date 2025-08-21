import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (user) {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ last_online: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error("Error updating last_online:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      console.log("User's last online status updated");
      return NextResponse.json({ success: true });
    } catch (e) {
        if (e instanceof Error) {
            return NextResponse.json({ success: false, error: e.message }, { status: 500 });
        }

        return NextResponse.json({ success: false, error: 'An unknown error occurred' }, { status: 500 });
    }
  }
  return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 });
}