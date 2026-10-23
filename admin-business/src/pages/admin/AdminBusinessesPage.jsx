import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Store,
  Search,
  PlusCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,

  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import api from "@/lib/axios";
import { getPublicBusinessUrl } from "@/lib/publicUrls";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { toast } from "@/store/toastStore";

export const AdminBusinessesPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [missingInfo, setMissingInfo] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [page, setPage] = useState(1);

  // Fetch categories & provinces for filter dropdowns
  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await api.get("/admin/business/categories");
      return res.data?.data || [];
    },
  });

  const { data: provinces } = useQuery({
    queryKey: ["public", "provinces"],
    queryFn: async () => {
      const res = await api.get("/business/public/provinces");
      return res.data?.data || [];
    },
  });

  // Fetch businesses
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "businesses", { page, search, status, missingInfo, categoryId, provinceId }],
    queryFn: async () => {
      const params = new URLSearchParams({ page });
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (missingInfo) params.append("missing_info", "1");
      if (categoryId) params.append("category_id", categoryId);
      if (provinceId) params.append("province_id", provinceId);

      const res = await api.get(`/admin/business/businesses?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/business/businesses/${id}`);
    },
    onSuccess: () => {
      toast.success("Business deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "businesses"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete business");
    },
  });

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const businesses = data?.items || data?.data?.items || [];
  const meta = data?.meta || data?.data?.meta || {};

  const quickFilters = [
    {
      key: "all",
      label: "All statuses",
      active: !status && !missingInfo,
      apply: () => {
        setStatus("");
        setMissingInfo(false);
        setPage(1);
      },
    },
    {
      key: "missing",
      label: "Missing info",
      active: missingInfo,
      apply: () => {
        setStatus("");
        setMissingInfo(true);
        setPage(1);
      },
    },
    {
      key: "draft",
      label: "Draft",
      active: status === "draft" && !missingInfo,
      apply: () => {
        setMissingInfo(false);
        setStatus("draft");
        setPage(1);
      },
    },
    {
      key: "pending_review",
      label: "Pending review",
      active: status === "pending_review" && !missingInfo,
      apply: () => {
        setMissingInfo(false);
        setStatus("pending_review");
        setPage(1);
      },
    },
  ];

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
            Directory operations
          </p>
          <h1 className="mt-1 text-2xl text-forest dark:text-cream">Businesses</h1>
          <p className="mt-1 text-sm text-muted dark:text-stone-400">
            Review listings, complete missing details, and manage publishing status.
          </p>
        </div>

        <Link
          to="/admin/businesses/create"
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control bg-brand-500 px-5 py-2.5 text-sm font-semibold text-forest shadow-gold transition hover:bg-brand-400"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Business</span>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {quickFilters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={filter.apply}
            className={`rounded-full border px-4 py-2 text-xs font-bold transition ${filter.active
              ? "border-brand-500 bg-brand-500 text-forest shadow-gold"
              : "border-line bg-cream text-muted hover:border-brand-300 hover:bg-brand-50 dark:border-white/10 dark:bg-white/5 dark:text-stone-300 dark:hover:bg-white/10"
              }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="portal-surface flex flex-col gap-3 p-4 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 h-4 w-4 text-brand-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Khmer / English name, slug, or owner..."
            className="w-full rounded-control border border-line bg-paper py-2.5 pl-11 pr-4 text-sm text-forest outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setMissingInfo(false);
            setPage(1);
          }}
          className="rounded-control border border-line bg-paper px-4 py-2.5 text-sm text-forest outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved (Public)</option>
          <option value="draft">Draft (Incomplete)</option>
          <option value="pending_review">Pending Review</option>
          <option value="suspended">Suspended (Hidden)</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="rounded-control border border-line bg-paper px-4 py-2.5 text-sm text-forest outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
        >
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_en} ({c.name_km})
            </option>
          ))}
        </select>

        {/* Province Filter */}
        <select
          value={provinceId}
          onChange={(e) => {
            setProvinceId(e.target.value);
            setPage(1);
          }}
          className="rounded-control border border-line bg-paper px-4 py-2.5 text-sm text-forest outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
        >
          <option value="">All Provinces</option>
          {provinces?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name_en} ({p.name_km})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="portal-surface overflow-hidden">
        {isLoading ? (
          <LoadingFallback />
        ) : businesses.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No businesses found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-4">Business</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Province</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Verified</th>
                  <th className="py-3.5 px-4">Internal Owner</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {businesses.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0 border border-stone-200 dark:border-stone-700">
                          {b.cover_image?.url_400 || b.cover_image?.url ? (
                            <img
                              src={b.cover_image.url_400 || b.cover_image.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-xs">
                              No Pic
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/admin/businesses/${b.id}/edit`}
                            className="font-bold text-stone-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400"
                          >
                            {b.name_km}
                          </Link>
                          <div className="text-xs text-stone-500 font-medium">{b.name_en}</div>
                          {!b.can_be_approved && b.status !== "approved" && (
                            <Link
                              to={`/admin/businesses/${b.id}/edit`}
                              title={Object.values(b.missing_requirements || {}).join(" ")}
                              className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 font-semibold hover:text-amber-700 hover:underline dark:hover:text-amber-300"
                            >
                              <AlertCircle className="w-3 h-3" />
                              <span>
                                Complete profile
                                {Object.keys(b.missing_requirements || {}).length > 0
                                  ? ` (${Object.keys(b.missing_requirements).length})`
                                  : ""}
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-stone-600 dark:text-stone-300">
                      {b.category?.name_en || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-stone-600 dark:text-stone-300">
                      {b.province?.name_en || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${b.status === "approved"
                          ? "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800"
                          : b.status === "pending_review"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                            : b.status === "suspended"
                              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                              : "bg-stone-100 text-stone-700 border border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700"
                          }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {b.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">Regular</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                        {b.owner_name || "—"}
                      </div>
                      <div className="text-xs text-stone-500">{b.owner_phone || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/businesses/${b.id}/edit`}
                          className="p-1.5 text-stone-600 hover:text-gold-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 rounded-lg transition"
                          title="Edit & Manage"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {b.status === "approved" && (
                          <a
                            href={getPublicBusinessUrl(b.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-stone-600 hover:text-teal-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 rounded-lg transition"
                            title="Preview as Visitor"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(b.id, b.name_en)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs text-stone-500">
            <div>
              Showing page {meta.current_page} of {meta.last_page} ({meta.total} businesses)
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= meta.last_page}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
