import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import PageMeta from '../components/PageMeta';

export interface Property {
  _id: string;
  title: string;
  description?: string;
  price: number;
  type: string;
  listingType: 'sale';
  location: { city: string; locality: string; address: string };
  area: number;
  bedrooms: number;
  bathrooms: number;
  images: Array<{ url: string; fileId: string }>;
}

interface PropertyResult {
  properties: Property[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState<PropertyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const response = await api.get<ApiResponse<PropertyResult>>('/properties', { params: Object.fromEntries(searchParams) });
        setResult(response.data.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <PageMeta title="Properties for Sale" description="Browse and filter houses, apartments, villas, plots and commercial properties across India." path="/properties" />
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">Discover properties</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950 md:text-5xl">Find a place you'll love</h1>
          <p className="mt-3 text-slate-600">Explore homes across India's most-loved cities and destinations.</p>
        </div>
        <div className="mb-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
          <select className="rounded-lg border border-slate-300 px-3 py-2.5" value={searchParams.get('location') || ''} onChange={(e) => setFilter('location', e.target.value)}>
            <option value="">All cities</option>
            {['Delhi','Mumbai','Pune','Jaipur','Ahmedabad','Lucknow','Kanpur','Udaipur','Manali','Shimla','Srinagar','Jammu','Gurugram','Bengaluru','Goa','Hyderabad','Mussoorie','Chennai'].map((city) => <option key={city}>{city}</option>)}
          </select>
          <select className="rounded-lg border border-slate-300 px-3 py-2.5" value={searchParams.get('type') || ''} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="">All types</option>
            {['apartment', 'house', 'villa', 'plot', 'commercial'].map((type) => <option key={type}>{type}</option>)}
          </select>
          <input className="rounded-lg border border-slate-300 px-3 py-2.5" type="number" placeholder="Min price" value={searchParams.get('minPrice') || ''} onChange={(e) => setFilter('minPrice', e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2.5" type="number" placeholder="Max price" value={searchParams.get('maxPrice') || ''} onChange={(e) => setFilter('maxPrice', e.target.value)} />
          <input className="rounded-lg border border-slate-300 px-3 py-2.5" type="number" placeholder="Min area sq ft" value={searchParams.get('minArea') || ''} onChange={(e) => setFilter('minArea', e.target.value)} />
        </div>

        {loading && <p className="py-10 text-center text-slate-500">Loading properties...</p>}
        {!loading && result?.properties.length === 0 && <p className="py-10 text-center text-slate-500">No properties found. Try changing your filters.</p>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result?.properties.map((property) => (
            <Link key={property._id} to={`/properties/${property._id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
              {property.images[0] ? (
                <img src={property.images[0].url} alt={property.title} className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-400">No image</div>
              )}
              <div className="p-4">
                <p className="text-xl font-bold text-brand-700">₹{property.price.toLocaleString('en-IN')}</p>
                <h2 className="mt-1 font-semibold text-slate-900">{property.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{property.location.locality}, {property.location.city}</p>
                <p className="mt-3 text-sm text-slate-700">{property.area.toLocaleString('en-IN')} sq ft · {property.bedrooms} BHK · {property.bathrooms} bath</p>
              </div>
            </Link>
          ))}
        </div>
        {result && result.pagination.pages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: result.pagination.pages }, (_, index) => index + 1).map((page) => (
              <button key={page} onClick={() => setFilter('page', String(page))} className={`rounded px-3 py-2 ${result.pagination.page === page ? 'bg-brand-600 text-white' : 'bg-white'}`}>{page}</button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
