// src/components/shared/FacebookPixel.jsx
"use client";

import { captureUtms } from '@/utils/utm';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '715929685674529';

const FacebookPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Única fonte de PageView: dispara no primeiro carregamento (mount)
  // e a cada troca de página. O snippet de init abaixo NÃO dispara mais
  // PageView, evitando a contagem duplicada.
  useEffect(() => {
    captureUtms();
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js' );
          fbq('init', '${FB_PIXEL_ID}');
        `,
      }}
    />
  );
};

export default FacebookPixel;