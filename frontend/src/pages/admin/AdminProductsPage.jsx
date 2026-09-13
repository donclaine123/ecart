import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit2, Trash2, Search, X, Check, AlertCircle, Package, Loader2, RefreshCw, Database } from 'lucide-react'
import api from '../../api/axios'

export default function AdminProductsPage() {
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_admin_products') || localStorage.getItem('ecart_products_catalog')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return []
  })
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_admin_categories')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return []
  })
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('ecart_admin_products') || localStorage.getItem('ecart_products_catalog')
      return !cached
    } catch {
      return true
    }
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const initialFormState = {
    name: '',
    category_id: '',
    sku: '',
    price: '',
    stock_quantity: 10,
    description: '',
    image_url: '',
    is_active: true,
    is_featured: false,
  }

  const [formData, setFormData] = useState(initialFormState)

  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh || products.length === 0) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setFetchError(null)

    try {
      // Parallel execution: fetch categories and admin products concurrently
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories', { timeout: 8000 }),
        api.get('/admin/products?per_page=100', { timeout: 8000 }).catch(async (adminErr) => {
          console.warn('Admin endpoint unavailable, fetching via database catalog endpoint:', adminErr.message)
          return api.get('/products?per_page=100', { timeout: 8000 })
        }),
      ])

      const catList = catRes?.data?.data || (Array.isArray(catRes?.data) ? catRes.data : [])
      if (Array.isArray(catList) && catList.length > 0) {
        setCategories(catList)
        try {
          localStorage.setItem('ecart_admin_categories', JSON.stringify(catList))
        } catch {}
      }

      const prodList = prodRes?.data?.data || (Array.isArray(prodRes?.data) ? prodRes.data : [])
      if (Array.isArray(prodList) && prodList.length > 0) {
        setProducts(prodList)
        try {
          localStorage.setItem('ecart_admin_products', JSON.stringify(prodList))
          localStorage.setItem('ecart_products_catalog', JSON.stringify(prodList))
          localStorage.setItem('ecart_products_db_cache', JSON.stringify(prodList))
        } catch {}
      }
    } catch (err) {
      console.error('Failed to retrieve catalog directly from database:', err)
      setFetchError(err.message || 'Unable to connect to database.')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [products.length])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({
      ...initialFormState,
      category_id: categories[0]?.id || '',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      category_id: product.category_id || categories[0]?.id || '',
      sku: product.sku || '',
      price: product.price || '',
      stock_quantity: product.stock_quantity ?? 0,
      description: product.description || '',
      image_url: product.image_url || '',
      is_active: Boolean(product.is_active),
      is_featured: Boolean(product.is_featured),
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormError('')

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity, 10),
      category_id: parseInt(formData.category_id, 10),
    }

    try {
      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct.id}`, payload)
        setProducts((prev) => {
          const updated = prev.map((p) => (p.id === editingProduct.id ? { ...p, ...res.data } : p))
          try {
            localStorage.setItem('ecart_admin_products', JSON.stringify(updated))
            localStorage.setItem('ecart_products_catalog', JSON.stringify(updated))
            localStorage.setItem('ecart_products_db_cache', JSON.stringify(updated))
          } catch {}
          return updated
        })
      } else {
        const res = await api.post('/admin/products', payload)
        setProducts((prev) => {
          const updated = [res.data, ...prev.filter((p) => p.id !== res.data.id)]
          try {
            localStorage.setItem('ecart_admin_products', JSON.stringify(updated))
            localStorage.setItem('ecart_products_catalog', JSON.stringify(updated))
            localStorage.setItem('ecart_products_db_cache', JSON.stringify(updated))
          } catch {}
          return updated
        })
      }
      setModalOpen(false)
      loadData()
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && Object.values(err.response.data.errors)[0]?.[0]) ||
        'Failed to save product.'
      setFormError(msg)
    } finally {
      setFormSubmitting(false)
    }
  }

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    setDeleteSubmitting(true)
    setDeleteError('')

    try {
      await api.delete(`/admin/products/${productToDelete.id}`)
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== productToDelete.id)
        try {
          localStorage.setItem('ecart_admin_products', JSON.stringify(updated))
          localStorage.setItem('ecart_products_catalog', JSON.stringify(updated))
          localStorage.setItem('ecart_products_db_cache', JSON.stringify(updated))
        } catch {}
        return updated
      })
      setProductToDelete(null)
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete product.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Catalog Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct CRUD control for models, live inventory allocations, and active pricing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh directly from live database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Database</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter database catalog by device title, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            <Database className="w-3 h-3" />
            <span>{filteredProducts.length} DB records</span>
            {isRefreshing && <Loader2 className="w-3 h-3 animate-spin text-emerald-600 ml-0.5" />}
          </span>
          <button
            onClick={() => loadData(true)}
            disabled={loading || isRefreshing}
            title="Refresh directly from live database"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto animate-pulse">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <tr key={n}>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-slate-100 rounded w-32" />
                          <div className="h-2.5 bg-slate-100 rounded w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><div className="h-3 bg-slate-100 rounded w-16" /></td>
                    <td className="py-3.5 px-4"><div className="h-3 bg-slate-100 rounded w-12" /></td>
                    <td className="py-3.5 px-4"><div className="h-3 bg-slate-100 rounded w-10" /></td>
                    <td className="py-3.5 px-4"><div className="h-5 bg-slate-100 rounded-full w-14" /></td>
                    <td className="py-3.5 px-6 text-right"><div className="h-4 bg-slate-100 rounded w-12 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="py-3 text-center border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span className="text-[11px] text-slate-500 font-semibold">Retrieving records directly from live database...</span>
            </div>
          </div>
        ) : fetchError && products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs text-slate-700 font-bold">Database Connection Notice</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">{fetchError}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Retry Database Query
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <p>No products found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url || '/placeholder.jpg'}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {p.category?.name || 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${parseFloat(p.price || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          p.stock_quantity <= 5
                            ? 'text-amber-600'
                            : p.stock_quantity === 0
                            ? 'text-rose-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {p.stock_quantity} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        />
                        <span className="text-[11px] text-slate-500">
                          {p.is_active ? 'Active' : 'Archived'}
                        </span>
                        {p.is_featured && (
                          <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[9px] font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(p)
                            setDeleteError('')
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5 my-8 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Device to Catalog'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ultra Horizon Pro Max"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="299.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Device specifications..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  Active in Catalog
                </label>
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-0"
                  />
                  Feature on Home
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern In-App Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Red Warning Badge */}
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>

            {/* Title & Prompt */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Delete Product</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete <span className="font-bold text-slate-900">"{productToDelete.name}"</span> ({productToDelete.sku}) from your catalog? This action cannot be undone.
              </p>
            </div>

            {/* Error Message if API fails */}
            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={() => setProductToDelete(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={handleConfirmDelete}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleteSubmitting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
