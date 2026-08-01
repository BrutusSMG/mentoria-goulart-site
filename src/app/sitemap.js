export default function sitemap( ) {
  const base = 'https://www.mentoriagarimpourbano.com.br';
  return [
    { url: base, lastModified: new Date( ), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/mentoria`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/produtos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];
}
