'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import { User } from '@supabase/supabase-js'

const HIDDEN_HEADER_PATHS = ['/yo']

export default function ConditionalHeader({ user }: { user: User | null }) {
  const pathname = usePathname()

  if (HIDDEN_HEADER_PATHS.includes(pathname)) {
    return null
  }

  return <Header user={user} />
}