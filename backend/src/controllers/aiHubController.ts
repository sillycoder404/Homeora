import axios, { AxiosError } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ApiError } from '../middleware/errorHandler';

export const aiSearchValidation = [
  body('query').trim().isLength({ min: 3 }).withMessage('Search query must contain at least 3 characters'),
];

interface Listing {
  title: string;
  price?: number;
  location?: string;
  bhk?: number;
  area?: number;
  source?: string;
  url: string;
  listingType?: string;
  reason?: string;
  score?: number;
}

async function withRetry<T>(operation: () => Promise<T>, label: string): Promise<T> {
  let delay = 500;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if ((status === 429 || (status && status >= 500)) && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw new ApiError(status === 429 ? 429 : 502, `${label} request failed`);
    }
  }
  throw new ApiError(502, `${label} request failed after retries`);
}

function sourceName(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Property portal';
  }
}

export async function searchAiListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ApiError(400, errors.array()[0].msg);
    if (process.env.AI_HUB_ENABLED !== 'true') throw new ApiError(503, 'AI Property Hub is disabled');

    const firecrawlKey = req.header('x-firecrawl-key');
    if (!firecrawlKey) throw new ApiError(400, 'Firecrawl key is required');

    const query = String(req.body.query).trim();
    const search = await withRetry(
      () => axios.post(
        'https://api.firecrawl.dev/v1/search',
        { query: `${query} sale listing`, limit: 8 },
        { headers: { Authorization: `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' } },
      ),
      'Firecrawl search',
    );

    const urls: string[] = (search.data?.data || [])
      .map((item: { url?: string }) => item.url)
      .filter((url: string | undefined): url is string => Boolean(url));

    const scraped = await Promise.all(
      urls.slice(0, 8).map(async (url) => {
        try {
          const response = await withRetry(
            () => axios.post(
              'https://api.firecrawl.dev/v1/scrape',
              { url, formats: ['markdown'] },
              { headers: { Authorization: `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' } },
            ),
            'Firecrawl scrape',
          );
          const data = response.data?.data || {};
          return {
            title: data.metadata?.title || data.title || 'Property listing',
            location: data.metadata?.location,
            url,
            source: sourceName(url),
            listingType: /rent|rental|lease|pg\b/i.test(`${data.markdown || ''}`) ? 'rent' : 'sale',
            rawText: (data.markdown || '').slice(0, 3500),
          };
        } catch {
          return null;
        }
      }),
    );

    let listings: Listing[] = scraped
      .filter((listing): listing is NonNullable<typeof listing> => Boolean(listing))
      .filter((listing) => listing.listingType === 'sale');

    const seen = new Set<string>();
    listings = listings.filter((listing) => {
      const normalized = listing.url.split('?')[0].toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });

    if (!process.env.AI_API_KEY || !process.env.AI_API_URL) {
      throw new ApiError(503, 'AI ranking API is not configured');
    }

    const ranking = await withRetry(
      () => axios.post(
        process.env.AI_API_URL!,
        {
          model: process.env.AI_MODEL || 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Rank property sale listings for the user query. Return JSON: {"rankings":[{"url":"string","score":number,"reason":"string"}]}. Score 0-100.' },
            { role: 'user', content: JSON.stringify({ query, listings }) },
          ],
        },
        { headers: { Authorization: `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' } },
      ),
      'AI ranking',
    );

    let rankings: Array<{ url: string; score: number; reason: string }> = [];
    try {
      const content = ranking.data?.choices?.[0]?.message?.content || '{}';
      rankings = JSON.parse(content).rankings || [];
    } catch {
      throw new ApiError(502, 'AI ranking returned invalid data');
    }

    const rankingMap = new Map(rankings.map((item) => [item.url, item]));
    const results = listings
      .map((listing) => ({ ...listing, ...(rankingMap.get(listing.url) || { score: 0, reason: 'No AI ranking available' }) }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    res.json({ success: true, message: 'Ranked property listings', data: results });
  } catch (error) {
    next(error);
  }
}
