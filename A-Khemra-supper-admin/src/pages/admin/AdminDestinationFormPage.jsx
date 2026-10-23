import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  Upload,
  Plus,
  Trash2,
  MapPin,
  Sparkles,
  Clock
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { provincesApi } from "@/lib/api/provinces";
import { categoriesApi } from "@/lib/api/categories";
import { toast } from "@/store/toastStore";
const AdminDestinationFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [provinces, setProvinces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameKm, setNameKm] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescEn, setShortDescEn] = useState("");
  const [shortDescKm, setShortDescKm] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descKm, setDescKm] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("12.5657");
  const [longitude, setLongitude] = useState("104.9910");
  const [openingHours, setOpeningHours] = useState("06:00 - 18:00");
  const [bestTimeToVisit, setBestTimeToVisit] = useState("November to April");
  const [howToGetThere, setHowToGetThere] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [priceLocal, setPriceLocal] = useState("0");
  const [priceForeign, setPriceForeign] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [highlights, setHighlights] = useState([""]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  useEffect(() => {
    provincesApi.getAll().then((res) => {
      if (res.data) setProvinces(res.data);
    });
    categoriesApi.getAll().then((res) => {
      if (res.data) setCategories(res.data);
    });
    if (isEdit && id) {
      setIsLoading(true);
      adminApi.getDestination(Number(id)).then((res) => {
        const d = res?.data?.destination || res?.data;
        if (d) {
          setNameEn(d.name_en || "");
          setNameKm(d.name_km || "");
          setProvinceId(String(d.province_id || ""));
          setCategoryId(String(d.category_id || ""));
          setShortDescEn(d.short_description_en || "");
          setShortDescKm(d.short_description_km || "");
          setDescEn(d.description_en || "");
          setDescKm(d.description_km || "");
          setAddress(d.address || "");
          setLatitude(String(d.latitude || "12.5657"));
          setLongitude(String(d.longitude || "104.9910"));
          setOpeningHours(d.opening_hours || "");
          setBestTimeToVisit(d.best_time_to_visit || "");
          setHowToGetThere(d.how_to_get_there || "");
          setIsFree(Boolean(d.is_free));
          setPriceLocal(String(d.price_local || 0));
          setPriceForeign(String(d.price_foreign || 0));
          setIsFeatured(Boolean(d.is_featured));
          setIsActive(Boolean(d.is_active));
          setHighlights(d.highlights && d.highlights.length > 0 ? d.highlights : [""]);
          if (d.cover_image) setCoverPreview(d.cover_image);
          if (d.images) setExistingImages(d.images);
        }
      }).catch(() => toast.error("Failed to load attraction")).finally(() => setIsLoading(false));
    }
  }, [id, isEdit]);
  const handleAddHighlight = () => {
    setHighlights([...highlights, ""]);
  };
  const handleRemoveHighlight = (index) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };
  const handleHighlightChange = (index, val) => {
    const updated = [...highlights];
    updated[index] = val;
    setHighlights(updated);
  };
  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };
  const handleDeleteExistingImage = async (imageId) => {
    if (!id) return;
    try {
      await adminApi.deleteDestinationImage(Number(id), imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Gallery photo deleted");
    } catch (err) {
      toast.error("Failed to delete image");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameEn || !nameKm || !provinceId || !categoryId) {
      toast.error("Please fill in required fields (Name EN/KM, Province, Category)");
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("name_en", nameEn);
      formData.append("name_km", nameKm);
      formData.append("province_id", provinceId);
      formData.append("category_id", categoryId);
      formData.append("short_description_en", shortDescEn);
      formData.append("short_description_km", shortDescKm);
      formData.append("description_en", descEn);
      formData.append("description_km", descKm);
      formData.append("address", address);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("opening_hours", openingHours);
      formData.append("best_time_to_visit", bestTimeToVisit);
      formData.append("how_to_get_there", howToGetThere);
      formData.append("is_free", isFree ? "1" : "0");
      formData.append("price_local", priceLocal);
      formData.append("price_foreign", priceForeign);
      formData.append("is_featured", isFeatured ? "1" : "0");
      formData.append("is_active", isActive ? "1" : "0");
      const cleanHighlights = highlights.filter((h) => h.trim().length > 0);
      cleanHighlights.forEach((h, i) => {
        formData.append(`highlights[${i}]`, h);
      });
      if (coverFile) {
        formData.append("cover_image", coverFile);
      }
      let destinationId = Number(id);
      if (isEdit && id) {
        await adminApi.updateDestination(destinationId, formData);
        toast.success("Destination updated successfully!");
      } else {
        const res = await adminApi.createDestination(formData);
        if (res.data?.id) destinationId = res.data.id;
        toast.success("Destination created successfully!");
      }
      if (galleryFiles.length > 0 && destinationId) {
        await adminApi.uploadDestinationImages(destinationId, galleryFiles);
      }
      navigate("/admin/destinations");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save destination");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {
    /* Top Header */
  }
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
    to="/admin/destinations"
    className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
  >
            <ArrowLeft className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-stone-900 dark:text-white">
              {isEdit ? "Edit Destination" : "Add New Destination"}
            </h1>
            <p className="text-xs text-stone-500">
              Provide bilingual details, admission fees, and coordinates
            </p>
          </div>
        </div>
      </div>

      {isLoading ? <div className="p-12 text-center text-stone-500">Loading attraction details...</div> : <form onSubmit={handleSubmit} className="space-y-8">
          {
    /* 1. Basic Info & Categories */
  }
          <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800">
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Name (English) *
                </label>
                <input
    type="text"
    value={nameEn}
    onChange={(e) => setNameEn(e.target.value)}
    placeholder="e.g. Angkor Wat"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Name (Khmer) *
                </label>
                <input
    type="text"
    value={nameKm}
    onChange={(e) => setNameKm(e.target.value)}
    placeholder="e.g. ប្រាសាទអង្គរវត្ត"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
    required
  />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Province *
                </label>
                <select
    value={provinceId}
    onChange={(e) => setProvinceId(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  >
                  <option value="">Select Province</option>
                  {provinces.map((p) => <option key={p.id} value={p.id}>
                      {p.name_en} ({p.name_km})
                    </option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Travel Category *
                </label>
                <select
    value={categoryId}
    onChange={(e) => setCategoryId(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  >
                  <option value="">Select Category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>
                      {c.name_en}
                    </option>)}
                </select>
              </div>
            </div>

            {
    /* Short Descriptions */
  }
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Short Description (English)
                </label>
                <textarea
    rows={2}
    value={shortDescEn}
    onChange={(e) => setShortDescEn(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Short Description (Khmer)
                </label>
                <textarea
    rows={2}
    value={shortDescKm}
    onChange={(e) => setShortDescKm(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
  />
              </div>
            </div>

            {
    /* Full Descriptions */
  }
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Full Story & Description (English)
                </label>
                <textarea
    rows={6}
    value={descEn}
    onChange={(e) => setDescEn(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Full Story & Description (Khmer)
                </label>
                <textarea
    rows={6}
    value={descKm}
    onChange={(e) => setDescKm(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-khmer"
  />
              </div>
            </div>
          </div>

          {
    /* 2. Location Coordinates */
  }
          <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span>Location Coordinates & Map Pin</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                Address / Commune
              </label>
              <input
    type="text"
    value={address}
    onChange={(e) => setAddress(e.target.value)}
    placeholder="e.g. Angkor Archaeological Park, Siem Reap"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Latitude
                </label>
                <input
    type="text"
    value={latitude}
    onChange={(e) => setLatitude(e.target.value)}
    placeholder="13.4125"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Longitude
                </label>
                <input
    type="text"
    value={longitude}
    onChange={(e) => setLongitude(e.target.value)}
    placeholder="103.8670"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
    required
  />
              </div>
            </div>
          </div>

          {
    /* 3. Practical Info & Fees */
  }
          <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Visitor Operations & Entrance Fees</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Opening Hours
                </label>
                <input
    type="text"
    value={openingHours}
    onChange={(e) => setOpeningHours(e.target.value)}
    placeholder="e.g. 05:00 AM - 05:30 PM daily"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                  Best Time to Visit
                </label>
                <input
    type="text"
    value={bestTimeToVisit}
    onChange={(e) => setBestTimeToVisit(e.target.value)}
    placeholder="e.g. November to March, early morning sunrise"
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                How to Get There
              </label>
              <textarea
    rows={2}
    value={howToGetThere}
    onChange={(e) => setHowToGetThere(e.target.value)}
    placeholder="Tuk-tuk from downtown, bicycle, road travel tips..."
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
            </div>

            {
    /* Entrance Fees */
  }
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 space-y-4">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-700 cursor-pointer">
                <input
    type="checkbox"
    checked={isFree}
    onChange={(e) => setIsFree(e.target.checked)}
    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
  />
                <span>Free Entry Attraction (No ticket required)</span>
              </label>

              {!isFree && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                      Foreign Visitor Price ($ USD)
                    </label>
                    <input
    type="number"
    value={priceForeign}
    onChange={(e) => setPriceForeign(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-1.5">
                      Cambodian Citizen Price (KHR Riels)
                    </label>
                    <input
    type="number"
    value={priceLocal}
    onChange={(e) => setPriceLocal(e.target.value)}
    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                  </div>
                </div>}
            </div>
          </div>

          {
    /* 4. Highlights */
  }
          <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Key Highlights / Experiences</span>
              </h3>
              <button
    type="button"
    onClick={handleAddHighlight}
    className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-sm"
  >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Highlight</span>
              </button>
            </div>

            <div className="space-y-2">
              {highlights.map((h, idx) => <div key={idx} className="flex items-center gap-2">
                  <input
    type="text"
    value={h}
    onChange={(e) => handleHighlightChange(idx, e.target.value)}
    placeholder="e.g. Sunrise view over reflection lotus ponds"
    className="flex-1 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-300 bg-white dark:bg-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
  />
                  {highlights.length > 1 && <button
    type="button"
    onClick={() => handleRemoveHighlight(idx)}
    className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100"
  >
                      <Trash2 className="w-4 h-4" />
                    </button>}
                </div>)}
            </div>
          </div>

          {
    /* 5. Images: Cover and Gallery */
  }
          <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-stone-900 dark:text-white pb-2 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600" />
              <span>Media & Photos</span>
            </h3>

            {
    /* Cover photo */
  }
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-2">
                Cover Photo (Primary)
              </label>
              <div className="flex items-center gap-4">
                {coverPreview && <img
    src={coverPreview}
    alt="cover preview"
    className="w-28 h-20 rounded-xl object-cover border border-amber-500 shadow-sm"
  />}
                <input
    type="file"
    accept="image/*"
    onChange={handleCoverSelect}
    className="text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-600 cursor-pointer"
  />
              </div>
            </div>

            {
    /* Gallery Upload */
  }
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-700 uppercase mb-2">
                Add to Photo Gallery (Multiple)
              </label>
              <input
    type="file"
    multiple
    accept="image/*"
    onChange={(e) => {
      if (e.target.files) setGalleryFiles(Array.from(e.target.files));
    }}
    className="text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer"
  />
            </div>

            {
    /* Existing images */
  }
            {existingImages.length > 0 && <div>
                <span className="block text-xs font-semibold text-stone-500 uppercase mb-2">
                  Existing Gallery Photos ({existingImages.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {existingImages.map((img) => <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-[4/3]">
                      <img src={img.image_url} alt="gallery" className="w-full h-full object-cover" />
                      <button
    type="button"
    onClick={() => handleDeleteExistingImage(img.id)}
    className="absolute inset-0 bg-red-600/70 text-white font-bold text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
  >
                        Delete
                      </button>
                    </div>)}
                </div>
              </div>}
          </div>

          {
    /* 6. Publication Settings */
  }
          <div className="bg-white dark:bg-stone-100 p-6 sm:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-700 cursor-pointer">
                <input
    type="checkbox"
    checked={isFeatured}
    onChange={(e) => setIsFeatured(e.target.checked)}
    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
  />
                <span>Feature on Homepage Must-Visit Section</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-700 cursor-pointer">
                <input
    type="checkbox"
    checked={isActive}
    onChange={(e) => setIsActive(e.target.checked)}
    className="rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4"
  />
                <span>Publish Immediately (Active status)</span>
              </label>
            </div>

            <button
    type="submit"
    disabled={isSubmitting}
    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-700 to-amber-600 hover:from-teal-800 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
  >
              {isSubmitting ? <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Attraction...</span>
                </> : <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Update Destination" : "Save & Publish"}</span>
                </>}
            </button>
          </div>
        </form>}
    </div>;
};
export {
  AdminDestinationFormPage
};
