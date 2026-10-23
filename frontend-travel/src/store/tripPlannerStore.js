import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tripsApi } from "@/lib/api/trips";

const DEFAULT_PLANS = [
  {
    id: "sample-siem-reap",
    title: "ដំណើរកម្សាន្តអង្គរ 3 ថ្ងៃ 2 យប់",
    title_en: "3-Day 2-Night Angkor Heritage Tour",
    province: "Siem Reap",
    days: [
      {
        day: 1,
        title: "ថ្ងៃទី 1: ប្រាសាទអង្គរវត្ត និងថ្ងៃលិចភ្នំបាខែង",
        title_en: "Day 1: Angkor Wat & Phnom Bakheng Sunset",
        items: [
          {
            id: "sr-item-1",
            name_km: "ប្រាសាទអង្គរវត្ត",
            name_en: "Angkor Wat",
            time: "08:00 AM",
            category: "Heritage",
            image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
            notes: "ទស្សនាប្រាសាទចម្បង និងថតរូបទេសភាពជញ្ជាំងចម្លាក់"
          },
          {
            id: "sr-item-2",
            name_km: "ភ្នំបាខែង",
            name_en: "Phnom Bakheng",
            time: "04:30 PM",
            category: "Sunset & Mountain",
            image: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80",
            notes: "មើលថ្ងៃលិចលើដែនដីអង្គរ (គួរទៅដល់មុនម៉ោង 4:00)"
          }
        ]
      },
      {
        day: 2,
        title: "ថ្ងៃទី 2: ក្រុងអង្គរធំ ប្រាសាទបាយ័ន និងតាព្រហ្ម",
        title_en: "Day 2: Angkor Thom, Bayon & Ta Prohm",
        items: [
          {
            id: "sr-item-3",
            name_km: "ប្រាសាទបាយ័ន",
            name_en: "Bayon Temple",
            time: "08:30 AM",
            category: "Heritage",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            notes: "ទស្សនាព្រះភក្ត្រព្រហ្មញញឹមដ៏ល្បីល្បាញ"
          },
          {
            id: "sr-item-4",
            name_km: "ប្រាសាទតាព្រហ្ម (ដើមឈើធំ)",
            name_en: "Ta Prohm Temple",
            time: "02:00 PM",
            category: "Nature & Ruins",
            image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
            notes: "ថតរូបឫសឈើបុរាណធំៗដុះព័ទ្ធជញ្ជាំងថ្ម"
          }
        ]
      },
      {
        day: 3,
        title: "ថ្ងៃទី 3: ភ្នំគូលែន និងទឹកធ្លាក់ធម្មជាតិ",
        title_en: "Day 3: Phnom Kulen National Park & Waterfalls",
        items: [
          {
            id: "sr-item-5",
            name_km: "ទឹកធ្លាក់ភ្នំគូលែន",
            name_en: "Phnom Kulen Waterfall",
            time: "09:30 AM",
            category: "Nature & Waterfalls",
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
            notes: "ងូតទឹកធ្លាក់ធម្មជាតិ និងទស្សនាស្ទឹងលិង្គមួយពាន់"
          }
        ]
      }
    ]
  }
];

export const useTripPlannerStore = create(
  persist(
    (set, get) => ({
      plans: DEFAULT_PLANS,
      activePlanId: "sample-siem-reap",

      getActivePlan: () => {
        const { plans, activePlanId } = get();
        return plans.find((p) => p.id === activePlanId) || plans[0] || null;
      },

      setActivePlanId: (id) => {
        set({ activePlanId: id });
      },

      createPlan: ({ title, title_en, province }) => {
        const newId = `trip-${Date.now()}`;
        const newPlan = {
          id: newId,
          title: title || "គម្រោងដំណើរកម្សាន្តថ្មី",
          title_en: title_en || "My Custom Trip",
          province: province || "Cambodia",
          days: [
            {
              day: 1,
              title: "ថ្ងៃទី 1: ចាប់ផ្តើមដំណើរ",
              title_en: "Day 1: Arrival & Exploration",
              items: []
            }
          ]
        };
        set((state) => ({
          plans: [newPlan, ...state.plans],
          activePlanId: newId
        }));
        return newId;
      },

      deletePlan: (id) => {
        set((state) => {
          const filtered = state.plans.filter((p) => p.id !== id);
          return {
            plans: filtered,
            activePlanId: filtered[0]?.id || null
          };
        });
      },

      addDayToActivePlan: () => {
        set((state) => {
          const plan = state.plans.find((p) => p.id === state.activePlanId);
          if (!plan) return state;
          const nextDayNum = (plan.days?.length || 0) + 1;
          const newDay = {
            day: nextDayNum,
            title: `ថ្ងៃទី ${nextDayNum}: ដំណើរកម្សាន្តបន្ត`,
            title_en: `Day ${nextDayNum}: Adventure Continues`,
            items: []
          };
          const updatedPlan = {
            ...plan,
            days: [...plan.days, newDay]
          };
          return {
            plans: state.plans.map((p) => (p.id === plan.id ? updatedPlan : p))
          };
        });
      },

      removeDayFromActivePlan: (dayNum) => {
        set((state) => {
          const plan = state.plans.find((p) => p.id === state.activePlanId);
          if (!plan || plan.days.length <= 1) return state;
          const updatedDays = plan.days
            .filter((d) => d.day !== dayNum)
            .map((d, index) => ({
              ...d,
              day: index + 1
            }));
          return {
            plans: state.plans.map((p) =>
              p.id === plan.id ? { ...plan, days: updatedDays } : p
            )
          };
        });
      },

      addDestinationToDay: (planId, dayNum, destination, customTime = "10:00 AM", customNote = "") => {
        set((state) => {
          const targetPlanId = planId || state.activePlanId;
          const plan = state.plans.find((p) => p.id === targetPlanId);
          if (!plan) return state;

          const updatedDays = plan.days.map((dayObj) => {
            if (dayObj.day === dayNum) {
              const newItem = {
                id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                destinationId: destination.id,
                slug: destination.slug,
                name_km: destination.name_km || destination.name_en,
                name_en: destination.name_en || destination.name_km,
                category: destination.category?.name_en || "Attraction",
                image:
                  destination.cover_image ||
                  destination.primary_image?.image_url ||
                  "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
                time: customTime,
                notes: customNote
              };
              return {
                ...dayObj,
                items: [...dayObj.items, newItem]
              };
            }
            return dayObj;
          });

          return {
            plans: state.plans.map((p) =>
              p.id === plan.id ? { ...plan, days: updatedDays } : p
            )
          };
        });
      },

      removeItemFromDay: (planId, dayNum, itemId) => {
        set((state) => {
          const targetPlanId = planId || state.activePlanId;
          const plan = state.plans.find((p) => p.id === targetPlanId);
          if (!plan) return state;

          const updatedDays = plan.days.map((dayObj) => {
            if (dayObj.day === dayNum) {
              return {
                ...dayObj,
                items: dayObj.items.filter((item) => item.id !== itemId)
              };
            }
            return dayObj;
          });

          return {
            plans: state.plans.map((p) =>
              p.id === plan.id ? { ...plan, days: updatedDays } : p
            )
          };
        });
      },

      updateItemTimeAndNote: (planId, dayNum, itemId, time, notes) => {
        set((state) => {
          const targetPlanId = planId || state.activePlanId;
          const plan = state.plans.find((p) => p.id === targetPlanId);
          if (!plan) return state;

          const updatedDays = plan.days.map((dayObj) => {
            if (dayObj.day === dayNum) {
              return {
                ...dayObj,
                items: dayObj.items.map((it) =>
                  it.id === itemId ? { ...it, time, notes } : it
                )
              };
            }
            return dayObj;
          });

          return {
            plans: state.plans.map((p) =>
              p.id === plan.id ? { ...plan, days: updatedDays } : p
            )
          };
        });
      },

      moveItemInDay: (planId, dayNum, itemId, direction) => {
        set((state) => {
          const targetPlanId = planId || state.activePlanId;
          const plan = state.plans.find((p) => p.id === targetPlanId);
          if (!plan) return state;

          const updatedDays = plan.days.map((dayObj) => {
            if (dayObj.day === dayNum) {
              const items = [...dayObj.items];
              const idx = items.findIndex((it) => it.id === itemId);
              if (idx === -1) return dayObj;

              if (direction === "up" && idx > 0) {
                const temp = items[idx];
                items[idx] = items[idx - 1];
                items[idx - 1] = temp;
              } else if (direction === "down" && idx < items.length - 1) {
                const temp = items[idx];
                items[idx] = items[idx + 1];
                items[idx + 1] = temp;
              }

              return { ...dayObj, items };
            }
            return dayObj;
          });

          return {
            plans: state.plans.map((p) =>
              p.id === plan.id ? { ...plan, days: updatedDays } : p
            )
          };
        });
      },

      loadServerTrips: async () => {
        try {
          const res = await tripsApi.getAll();
          const serverItems = res?.data?.items || res?.items || [];
          if (Array.isArray(serverItems) && serverItems.length > 0) {
            const formatted = serverItems.map((st) => ({
              id: String(st.id),
              title: st.title,
              title_en: st.title_en || st.title,
              province: st.province || "Siem Reap",
              days: Array.from({ length: st.days_count || 1 }, (_, i) => {
                const dayNum = i + 1;
                return {
                  day: dayNum,
                  title: `ថ្ងៃទី ${dayNum}`,
                  title_en: `Day ${dayNum}`,
                  items: (st.items || [])
                    .filter((it) => it.day_number === dayNum)
                    .map((it) => ({
                      id: String(it.id),
                      destinationId: it.destination_id,
                      slug: it.slug,
                      name_km: it.name_km,
                      name_en: it.name_en || it.name_km,
                      category: it.category || "Attraction",
                      image: it.image || "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
                      time: it.time || "09:00 AM",
                      notes: it.notes || ""
                    }))
                };
              })
            }));

            set((state) => ({
              plans: [...formatted, ...state.plans.filter((p) => p.id === "sample-siem-reap")],
              activePlanId: formatted[0]?.id || state.activePlanId
            }));
          }
        } catch (e) {
          console.log("Could not load trips from server", e);
        }
      },

      syncGuestPlansOnLogin: async () => {
        const { plans } = get();
        const customPlans = plans.filter((p) => p.id !== "sample-siem-reap");
        if (customPlans.length === 0) {
          await get().loadServerTrips();
          return;
        }

        try {
          await tripsApi.syncGuestPlans(customPlans);
          await get().loadServerTrips();
        } catch (e) {
          console.log("Could not sync guest plans", e);
        }
      }
    }),
    {
      name: "khemara_trip_planner",
      version: 1
    }
  )
);
