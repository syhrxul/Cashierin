'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShoppingCart,
  DollarSign,
  Database,
  Tag,
  ChevronRight,
  TrendingUp,
  Settings2,
  Box
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import ProductModal from './components/ProductModal';
import CategoryModal from './components/CategoryModal';

export default function OwnerProductsPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Data State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [store, setStore] = useState<any>(null);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '',
    price: 0,
    stock: 0,
    description: '',
    is_active: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, storeRes]: any = await Promise.all([
        apiFetch('/products'),
        apiFetch('/categories'),
        apiFetch('/store/info')
      ]);

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setStore(storeRes.data || storeRes);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory ? p.category_id === activeCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Product Actions
  const handleAddProductOpen = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category_id: categories[0]?.id || '',
      price: 0,
      stock: 0,
      description: '',
      is_active: true
    });
    setIsProductModalOpen(true);
  };

  const handleEditProductOpen = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category_id: product.category_id || '',
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      is_active: product.is_active
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editingProduct ? `/products/${editingProduct.id}` : '/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        ...productForm,
        store_id: store?.id
      };

      await apiFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      setMessage({ type: 'success', text: editingProduct ? 'Produk diperbarui!' : 'Produk ditambahkan!' });
      setIsProductModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Hapus produk ini secara permanen?')) return;
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Produk dihapus.' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Category Actions
  const handleAddCategoryOpen = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '' });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editingCategory ? `/categories/${editingCategory.id}` : '/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      await apiFetch(url, {
        method,
        body: JSON.stringify({ ...categoryForm, store_id: store?.id })
      });

      setMessage({ type: 'success', text: 'Kategori disimpan!' });
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleProductStatus = async (product: any) => {
    try {
      await apiFetch(`/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !product.is_active })
      });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Syncing Inventory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 p-6 md:p-10 animate-in fade-in duration-700">
      {/* Header View */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-200/60 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12"><Box size={240} /></div>
        <div className="space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <TrendingUp size={14} className="fill-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">Inventory Management</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-[#0F172A] uppercase">Master Produk</h1>
          <p className="text-sm text-slate-400 font-medium max-w-lg">Kelola nama barang, harga, dan stok yang akan muncul di menu kasir.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 relative z-10">
          <button
            onClick={handleAddCategoryOpen}
            className="h-20 px-8 bg-indigo-50 text-indigo-600 rounded-[2rem] border border-indigo-100 font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-white transition-all active:scale-95"
          >
            <Layers size={20} /> Tambah Kategori
          </button>
          <button
            onClick={handleAddProductOpen}
            className="h-20 px-10 bg-[#0F172A] text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95"
          >
            <Plus size={24} /> Produk Baru
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="font-bold text-sm uppercase tracking-widest">{message.text}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white h-20 px-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-50 flex items-center gap-6 group focus-within:ring-2 ring-indigo-50 transition-all">
            <Search className="text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={24} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama produk atau SKU..."
              className="flex-1 bg-transparent border-none outline-none font-bold text-slate-600 placeholder:text-slate-200 tracking-tight"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            <button
              onClick={() => setActiveCategory(null)}
              className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all whitespace-nowrap ${!activeCategory ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
            >
              Semua Menu
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid/Table */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-10 py-8">Nama & Kategori</th>
                  <th className="px-10 py-8 text-center">Harga</th>
                  <th className="px-10 py-8 text-center">Stok</th>
                  <th className="px-10 py-8 text-center">Status</th>
                  <th className="px-10 py-8 text-right pr-14">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center opacity-30 italic">
                      <Box size={64} className="mx-auto mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Produk tidak ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-black text-sm uppercase text-[#0F172A] tracking-tighter mb-1">{p.name}</h4>
                            <div className="flex items-center gap-2">
                              <Tag size={10} className="text-indigo-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{p.category_name || 'Tanpa Kategori'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center font-black text-slate-600">
                        <span className="text-[10px] text-slate-300 mr-1">RP</span>
                        {p.price.toLocaleString('id-ID')}
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className={`inline-flex px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest ${p.stock <= 5 ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-50 text-slate-500'}`}>
                          {p.stock <= 5 && <AlertCircle size={10} className="mr-2" />}
                          {p.stock} Unit
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <button
                          onClick={() => toggleProductStatus(p)}
                          className={`h-10 px-6 rounded-full font-black uppercase tracking-widest text-[9px] transition-all ${p.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 opacity-50'}`}
                        >
                          {p.is_active ? 'Aktif' : 'Non-Aktif'}
                        </button>
                      </td>
                      <td className="px-10 py-8 text-right pr-14">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditProductOpen(p)}
                            className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-inner active:scale-90"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-inner active:scale-90"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductModal
          onClose={() => setIsProductModalOpen(false)}
          form={productForm}
          setForm={setProductForm}
          onSubmit={handleSaveProduct}
          loading={actionLoading}
          categories={categories}
          isEdit={!!editingProduct}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          form={categoryForm}
          setForm={setCategoryForm}
          onSubmit={handleSaveCategory}
          loading={actionLoading}
          isEdit={!!editingCategory}
        />
      )}
    </div>
  );
}
