/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
    ],
    qualities: [40, 60, 75],
  },

  async headers( ) {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impede que o site seja carregado dentro de iframes de outros domínios (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Impede o navegador de "adivinhar" tipos de conteúdo (MIME sniffing)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla quanta informação de referência sai do seu site
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Desativa APIs sensíveis do navegador que o site não usa
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          // Força HTTPS por 2 anos (a Vercel já redireciona para HTTPS; isto blinda o retorno)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
