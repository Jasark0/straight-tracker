// app/components/ContactSuccessToast.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ContactSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === '1') {
      toast.success("Thank you for contacting us! We will read your suggestion/inquiry thoroughly and get back to you as soon as we can!");
      router.replace(window.location.pathname); // Removes query param
    }
  }, [searchParams]);

  return null;
}
