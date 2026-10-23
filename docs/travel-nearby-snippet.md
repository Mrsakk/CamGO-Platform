# Nearby Tourism Businesses Integration Snippet for Travel

This snippet is prepared for the **CamGO Travel** team to display nearby verified businesses on destination detail pages (`frontend-travel/src/pages/public/DestinationDetailPage.jsx`).

> [!IMPORTANT]
> In accordance with Phase 2 locked constraints, do not modify `frontend-travel/` directly at this stage. When the Travel team is ready to enable cross-linking, paste the component below into the destination detail template.

---

## 1. Backend Endpoint
- **URL**: `GET /api/v1/destinations/{slug}/nearby-businesses?limit=6`
- **Response Format**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "angkor-heritage-boutique",
      "name_km": "សណ្ឋាគារ អង្គរ ហេរីថេច ប៊ូទិក",
      "name_en": "Angkor Heritage Boutique Hotel",
      "category": {
        "id": 1,
        "name_km": "សណ្ឋាគារ និងផ្ទះសំណាក់",
        "name_en": "Accommodation"
      },
      "cover_url": "http://localhost:8000/storage/business/media/thumb_800_photo.webp",
      "rating_avg": 4.8,
      "is_verified": true,
      "distance_km": 2.4
    }
  ]
}
```

---

## 2. Ready-to-Paste React Component

Save as `frontend-travel/src/components/destination/NearbyBusinessesSection.jsx`:

```jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Store, Star, CheckCircle, Compass, ArrowRight, ExternalLink } from "lucide-react";
import axios from "@/lib/axios"; // Uses the existing Travel axios instance

export const NearbyBusinessesSection = ({ destinationSlug }) => {
  const { t, i18n } = useTranslation();
  const isKm = i18n.language === "km";

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["travel", "destinations", destinationSlug, "nearby-businesses"],
    queryFn: async () => {
      const res = await axios.get(`/destinations/${destinationSlug}/nearby-businesses?limit=6`);
      return res.data?.data || [];
    },
    enabled: Boolean(destinationSlug),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading || businesses.length === 0) {
    return null;
  }

  const businessSiteUrl = import.meta.env.VITE_BUSINESS_BASE_URL || "http://localhost:5175";

  return (
    <section className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-1">
            <Store className="w-3.5 h-3.5" />
            <span>{isKm ? "សេវាកម្មក្នុងស្រុក" : "Local Services"}</span>
          </div>
          <h3 className="text-xl font-bold text-stone-900 dark:text-white">
            {isKm ? "អាជីវកម្មទេសចរណ៍នៅជិតតំបន់នេះ" : "Nearby Tourism Businesses"}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {isKm
              ? "សណ្ឋាគារ ភោជនីយដ្ឋាន មគ្គុទ្ទេសក៍ និងមធ្យោបាយធ្វើដំណើរ ដែលអាចទាក់ទងផ្ទាល់បាន"
              : "Hotels, dining, tour guides, and transport you can contact directly with zero fees."}
          </p>
        </div>

        <a
          href={`${businessSiteUrl}/businesses?destination=${destinationSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <span>{isKm ? "មើលទាំងអស់" : "View All"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {businesses.map((biz) => {
          const name = isKm ? biz.name_km || biz.name_en : biz.name_en || biz.name_km;
          const category = isKm ? biz.category?.name_km : biz.category?.name_en;

          return (
            <a
              key={biz.id}
              href={`${businessSiteUrl}/b/${biz.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-amber-500/50 transition flex gap-3.5"
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 relative">
                <img
                  src={biz.cover_url || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=300&q=80"}
                  alt={name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="font-semibold text-amber-600 dark:text-amber-400 truncate">
                      {category}
                    </span>
                    {biz.distance_km && (
                      <span className="flex items-center gap-0.5">
                        <Compass className="w-3 h-3" />
                        <span>{biz.distance_km} km</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-stone-900 dark:text-white truncate group-hover:text-amber-500 transition-colors mt-0.5">
                    {name}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>{biz.rating_avg ? Number(biz.rating_avg).toFixed(1) : "New"}</span>
                  </div>

                  {biz.is_verified && (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
```

---

## 3. Placement in Destination Page
In `frontend-travel/src/pages/public/DestinationDetailPage.jsx`, import and place the component right below the destination review section:

```jsx
import { NearbyBusinessesSection } from "@/components/destination/NearbyBusinessesSection";

// Inside the JSX render tree:
<NearbyBusinessesSection destinationSlug={destination.slug} />
```
