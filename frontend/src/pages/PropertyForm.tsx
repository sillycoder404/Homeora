import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import type { ApiResponse } from '../services/api';
import type { Property } from './Listings';

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '', description: '', price: '', type: 'apartment', listingType: 'sale',
    city: '', locality: '', address: '', area: '', bedrooms: '1', bathrooms: '1',
  });

  useEffect(() => {
    if (!id) return;
    api.get<ApiResponse<Property>>(`/properties/${id}`).then((response) => {
      const property = response.data.data;
      setForm({
        title: property.title, description: (property as Property & { description?: string }).description || '',
        price: String(property.price), type: property.type, listingType: property.listingType,
        city: property.location.city, locality: property.location.locality, address: property.location.address,
        area: String(property.area), bedrooms: String(property.bedrooms), bathrooms: String(property.bathrooms),
      });
    });
  }, [id]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function chooseImages(files: FileList | null) {
    const selected = Array.from(files || []).slice(0, 4);
    setImages(selected);
    setPreviews(selected.map((file) => URL.createObjectURL(file)));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const body = new FormData();
    for (const key of ['title', 'description', 'price', 'type', 'listingType', 'area', 'bedrooms', 'bathrooms']) {
      body.append(key, form[key as keyof typeof form]);
    }
    body.append('location', JSON.stringify({
      city: form.city,
      locality: form.locality,
      address: form.address,
    }));
    images.forEach((image) => body.append('images', image));

    try {
      const response = id
        ? await api.put<ApiResponse<Property>>(`/properties/${id}`, body)
        : await api.post<ApiResponse<Property>>('/properties', body);
      navigate(`/properties/${response.data.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save property');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-6">
      <form onSubmit={submit} className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">{id ? 'Edit property' : 'Add property'}</h1>
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">Title
            <input className="mt-1 w-full rounded border px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="text-sm font-medium">Price (₹)
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </label>
          <label className="text-sm font-medium">Property type
            <select className="mt-1 w-full rounded border px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['apartment', 'house', 'villa', 'plot', 'commercial'].map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium">Area (sq ft)
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" min="0" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
          </label>
          <label className="text-sm font-medium">Bedrooms
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" min="0" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} required />
          </label>
          <label className="text-sm font-medium">Bathrooms
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" min="0" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} required />
          </label>
          <label className="text-sm font-medium">City
            <input className="mt-1 w-full rounded border px-3 py-2" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </label>
          <label className="text-sm font-medium">Locality
            <input className="mt-1 w-full rounded border px-3 py-2" value={form.locality} onChange={(e) => setForm({ ...form, locality: e.target.value })} required />
          </label>
        </div>

        <label className="block text-sm font-medium">Full address
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </label>
        <label className="block text-sm font-medium">Description
          <textarea className="mt-1 min-h-28 w-full rounded border px-3 py-2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </label>
        <label className="block text-sm font-medium">Images (JPG, PNG or WebP, up to 4)
          <input className="mt-1 block w-full" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => chooseImages(e.target.files)} />
        </label>
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {previews.map((preview) => <img key={preview} src={preview} alt="Preview" className="h-32 w-full rounded object-cover" />)}
          </div>
        )}
        <button disabled={loading} className="rounded bg-brand-600 px-5 py-2 font-semibold text-white">
          {loading ? 'Saving...' : id ? 'Save changes' : 'Add property'}
        </button>
      </form>
    </main>
  );
}
