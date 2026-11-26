import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import api from '../services/api';

interface RankedListing {
  title: string;
  source: string;
  url: string;
  location?: string;
  score: number;
  reason: string;
  listingType: 'sale';
}

export default function AiHub() {
  const [query, setQuery] = useState('');
  const [firecrawlKey, setFirecrawlKey] = useState('');
  const [results, setResults] = useState<RankedListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFirecrawlKey(localStorage.getItem('firecrawlKey') || '');
  }, []);

  function saveKey(value: string) {
    setFirecrawlKey(value);
    localStorage.setItem('firecrawlKey', value);
  }

  async function search(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    setResults([]);

    if (!firecrawlKey) {
      setError('Enter your Firecrawl key');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post<{ success: boolean; data: RankedListing[] }>(
        '/ai-hub/search',
        { query },
        { headers: { 'x-firecrawl-key': firecrawlKey } },
      );
      setResults(response.data.data);
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (err.response?.status === 429) setError('Rate limit reached. Automatic retries finished; please try again later.');
      else setError(message || 'Unable to search property listings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      <h1 className="text-3xl font-bold">AI Property Hub</h1>
      <p className="mt-2 text-slate-600">Search live sale listings, then rank matches using your configured AI provider.</p>

      <form onSubmit={search} className="mt-5 space-y-3 rounded-xl bg-white p-5 shadow">
        <input className="w-full rounded border px-3 py-2" type="password" placeholder="Your Firecrawl API key" value={firecrawlKey} onChange={(e) => saveKey(e.target.value)} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <input className="min-w-0 flex-1 rounded border px-3 py-2" placeholder="Example: 2BHK flat in Pune" value={query} onChange={(e) => setQuery(e.target.value)} required />
          <button disabled={loading} className="rounded bg-brand-600 px-5 py-2 font-semibold text-white">
            {loading ? 'Searching and ranking...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 rounded bg-red-50 p-4 text-red-700">{error}</p>}
      {loading && <p className="mt-6 text-center text-slate-500">Searching property portals and scraping listings...</p>}

      <div className="mt-6 space-y-4">
        {results.map((listing) => (
          <article key={listing.url} className="rounded-xl bg-white p-5 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">{listing.source}</span>
                <h2 className="mt-3 text-lg font-bold">{listing.title}</h2>
                {listing.location && <p className="text-sm text-slate-600">{listing.location}</p>}
              </div>
              <div className="rounded-full bg-brand-600 px-3 py-2 text-sm font-bold text-white">{listing.score}/100</div>
            </div>
            <p className="mt-3 text-slate-700">{listing.reason}</p>
            <a href={listing.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-brand-700">View original listing →</a>
          </article>
        ))}
        {!loading && results.length === 0 && !error && <p className="py-8 text-center text-slate-500">No search has been run yet.</p>}
      </div>
    </main>
  );
}
