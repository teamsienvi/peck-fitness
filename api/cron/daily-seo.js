// Vercel Cron Serverless Function: Daily SEO Sitemap & Core Route Verification for Peck Fitness (peckfitness.ai)
// Scheduled via vercel.json at "0 4 * * *" (04:00 UTC / 12:00 PM PHT)

const SITE_URL = process.env.SITE_URL || 'https://peckfitness.ai';

const CORE_ROUTES = [
  '/',
  '/assistant',
  '/train',
  '/sitemap.xml',
  '/robots.txt',
];

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const checks = await Promise.all(
      CORE_ROUTES.map(async (route) => {
        const url = `${SITE_URL}${route}`;
        const start = Date.now();
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: { 'User-Agent': 'PeckFitness-Daily-SEO-Cron/1.0' },
          });
          return {
            route,
            status: response.status,
            ok: response.ok,
            latencyMs: Date.now() - start,
          };
        } catch (err) {
          return {
            route,
            status: 0,
            ok: false,
            latencyMs: Date.now() - start,
            error: err?.message || 'Fetch error',
          };
        }
      })
    );

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      siteUrl: SITE_URL,
      checks,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Daily SEO cron failed',
      details: error?.message || String(error),
    });
  }
}

