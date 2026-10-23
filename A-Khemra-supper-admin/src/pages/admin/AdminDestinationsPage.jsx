import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Star,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { provincesApi } from "@/lib/api/provinces";
import { categoriesApi } from "@/lib/api/categories";
import { toast } from "@/store/toastStore";
const AdminDestinationsPage = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    provincesApi.getAll().then((res) => {
      if (res.data) setProvinces(res.data);
    });
    categoriesApi.getAll().then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);
  const fetchDestinations = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDestinations({
        search: search.trim() || void 0,
        province_id: provinceId || void 0,
        category_id: categoryId || void 0,
        status: status || void 0,
        page,
        per_page: 15
      });
      const list = res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      setDestinations(list);
      if (res?.meta) setMeta(res.meta);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load destinations");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDestinations();
  }, [search, provinceId, categoryId, status, page]);
  const handleToggleFeatured = async (id) => {
    try {
      const res = await adminApi.toggleDestinationFeatured(id);
      if (res.data) {
        setDestinations(
          (prev) => prev.map((d) => d.id === id ? { ...d, is_featured: res.data.is_featured } : d)
        );
        toast.success("Featured status updated");
      }
    } catch (err) {
      toast.error("Failed to toggle featured status");
    }
  };
  const handleToggleStatus = async (id) => {
    try {
      const res = await adminApi.toggleDestinationStatus(id);
      if (res.data) {
        setDestinations(
          (prev) => prev.map((d) => d.id === id ? { ...d, is_active: res.data.is_active } : d)
        );
        toast.success("Active status updated");
      }
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await adminApi.deleteDestination(id);
      setDestinations((prev) => prev.filter((d) => d.id !== id));
      toast.success("Destination deleted successfully");
    } catch (err) {
      toast.error("Failed to delete destination");
    }
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white">
            Destinations Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage tourist attractions, upload photo galleries, set coordinates, and feature items
          </p>
        </div>

        <Link
    to="/admin/destinations/create"
    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 self-start sm:self-auto"
  >
          <Plus className="w-4 h-4" />
          <span>Add Destination</span>
        </Link>
      </div>

      {
    /* Filter Bar */
  }
      <div className="bg-white dark:bg-stone-100 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {
    /* Search */
  }
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
    type="text"
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
    placeholder="Search name..."
    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500"
  />
        </div>

        {
    /* Province */
  }
        <select
    value={provinceId}
    onChange={(e) => {
      setProvinceId(e.target.value);
      setPage(1);
    }}
    className="py-2 px-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500"
  >
          <option value="">All Provinces</option>
          {provinces.map((prov) => <option key={prov.id} value={prov.id}>
              {prov.name_en}
            </option>)}
        </select>

        {
    /* Category */
  }
        <select
    value={categoryId}
    onChange={(e) => {
      setCategoryId(e.target.value);
      setPage(1);
    }}
    className="py-2 px-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500"
  >
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>
              {cat.name_en}
            </option>)}
        </select>

        {
    /* Status */
  }
        <select
    value={status}
    onChange={(e) => {
      setStatus(e.target.value);
      setPage(1);
    }}
    className="py-2 px-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-300 focus:outline-none focus:border-amber-500"
  >
          <option value="">All Statuses</option>
          <option value="active">Active (Published)</option>
          <option value="inactive">Inactive (Draft)</option>
        </select>
      </div>

      {
    /* Destinations Data Table */
  }
      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 uppercase tracking-wider font-bold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="p-4">Attraction</th>
                <th className="p-4">Province</th>
                <th className="p-4">Category</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-center">Featured</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-700">
              {isLoading ? <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    Loading attractions...
                  </td>
                </tr> : destinations.length === 0 ? <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    No destinations match the filters
                  </td>
                </tr> : destinations.map((dest) => <tr key={dest.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    {
    /* Attraction details */
  }
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
    src={dest.cover_image || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=120&q=80"}
    alt={dest.name_en}
    className="w-12 h-10 rounded-lg object-cover bg-stone-200"
  />
                        <div>
                          <span className="font-bold text-stone-900 dark:text-stone-900 block truncate max-w-xs">
                            {dest.name_en}
                          </span>
                          <span className="text-small text-amber-600 block">
                            {dest.name_km}
                          </span>
                        </div>
                      </div>
                    </td>

                    {
    /* Province */
  }
                    <td className="p-4 font-medium">
                      {dest.province?.name_en || "\u2014"}
                    </td>

                    {
    /* Category */
  }
                    <td className="p-4 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-small font-bold">
                        {dest.category?.name_en || "\u2014"}
                      </span>
                    </td>

                    {
    /* Rating */
  }
                    <td className="p-4">
                      <span className="font-bold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{Number(dest.rating_avg ?? dest.avg_rating ?? 0).toFixed(1)}</span>
                        <span className="text-stone-400 text-small">({dest.rating_count ?? dest.reviews_count ?? 0})</span>
                      </span>
                    </td>

                    {
    /* Featured toggle */
  }
                    <td className="p-4 text-center">
                      <button
    type="button"
    onClick={() => handleToggleFeatured(dest.id)}
    className={`px-2.5 py-1 rounded-full text-small font-bold transition-colors ${dest.is_featured ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" : "bg-stone-100 dark:bg-stone-800 text-stone-400"}`}
  >
                        {dest.is_featured ? "\u2605 Featured" : "Standard"}
                      </button>
                    </td>

                    {
    /* Status toggle */
  }
                    <td className="p-4 text-center">
                      <button
    type="button"
    onClick={() => handleToggleStatus(dest.id)}
    className={`px-2.5 py-1 rounded-full text-small font-bold transition-colors ${dest.is_active ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : "bg-stone-200 dark:bg-stone-800 text-stone-400"}`}
  >
                        {dest.is_active ? "Active" : "Draft"}
                      </button>
                    </td>

                    {
    /* Actions */
  }
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
    to={`/destinations/${dest.slug}`}
    target="_blank"
    title="View public page"
    className="p-1.5 rounded-lg text-stone-400 hover:text-teal-600 hover:bg-stone-100 dark:hover:bg-stone-800"
  >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
    to={`/admin/destinations/${dest.id}/edit`}
    title="Edit"
    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
  >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
    type="button"
    onClick={() => handleDelete(dest.id, dest.name_en)}
    title="Delete"
    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
  >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>

        {
    /* Pagination Bar */
  }
        {meta && meta.last_page > 1 && <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing {destinations.length} of {meta.total} destinations
            </span>
            <div className="flex items-center gap-1">
              <button
    disabled={page <= 1}
    onClick={() => setPage((p) => p - 1)}
    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40"
  >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-semibold">
                Page {page} of {meta.last_page}
              </span>
              <button
    disabled={page >= meta.last_page}
    onClick={() => setPage((p) => p + 1)}
    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 disabled:opacity-40"
  >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>}
      </div>
    </div>;
};
export {
  AdminDestinationsPage
};
