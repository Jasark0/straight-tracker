import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ available: false, error: 'Invalid username' }, { status: 400 })
  }

  const { data } = await supabase
    .from('user')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  return NextResponse.json({ available: !data })
}
