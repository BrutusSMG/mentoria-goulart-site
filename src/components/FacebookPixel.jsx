// src/components/FacebookPixel.jsx
"use client";

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const FB_PIXEL_ID = '1383830073227216'; // <-- COLOQUE SEU ID AQUI

const FacebookPixel = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Esse useEffect garante que o evento 'PageView' seja disparado toda vez 
  // que o usuário trocar de página (ex: da Home para a Mentoria)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive" // Carrega logo após a página ficar interativa (não trava o site)
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
          fbq('track', 'PageView');
        `,
      }}
    />
  );
};

export default FacebookPixel;
