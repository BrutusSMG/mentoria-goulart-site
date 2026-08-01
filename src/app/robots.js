export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Páginas internas do funil não devem ser indexadas
        disallow: ['/download', '/quase-la', '/api/'],
      },
    ],
    sitemap: 'https://www.mentoriagarimpourbano.com.br/sitemap.xml',
  };
}
