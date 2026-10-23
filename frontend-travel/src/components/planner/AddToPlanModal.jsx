import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, Calendar, Clock, Plus } from "lucide-react";
import { useTripPlannerStore } from "@/store/tripPlannerStore";
import { toast } from "@/store/toastStore";

const toKm = (n) => (n === null || n === undefined ? "0" : String(n));

export const AddToPlanModal = ({ destination, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const km = i18n.language === "km";

  const {
    plans,
    activePlanId,
    createPlan,
    addDestinationToDay
  } = useTripPlannerStore();

  const [selectedPlanId, setSelectedPlanId] = useState(activePlanId || plans[0]?.id || "");
  const [selectedDay, setSelectedDay] = useState(1);
  const [time, setTime] = useState("09:00 AM");
  const [note, setNote] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState("");

  if (!isOpen || !destination) return null;

  const currentPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const daysList = currentPlan?.days || [{ day: 1 }];

  const handleCreateNewTrip = (e) => {
    e.preventDefault();
    if (!newTripTitle.trim()) return;
    const newId = createPlan({
      title: newTripTitle,
      title_en: newTripTitle,
      province: destination.province?.name_km || destination.province?.name_en || "កម្ពុជា"
    });
    setSelectedPlanId(newId);
    setSelectedDay(1);
    setIsCreatingNew(false);
    setNewTripTitle("");
    toast.success(km ? "បានបង្កើតកាលវិភាគថ្មីជោគជ័យ!" : "New trip created!");
  };

  const handleAdd = () => {
    if (!selectedPlanId && plans.length === 0) {
      const newId = createPlan({
        title: km ? "ដំណើរកម្សាន្តកម្ពុជា" : "My Cambodia Trip",
        province: destination.province?.name_km || destination.province?.name_en || "កម្ពុជា"
      });
      addDestinationToDay(newId, 1, destination, time, note);
    } else {
      addDestinationToDay(selectedPlanId, Number(selectedDay), destination, time, note);
    }

    toast.success(
      km
        ? `បានបញ្ចូល "${destination.name_km || destination.name_en}" ទៅក្នុងកាលវិភាគ!`
        : `Added "${destination.name_en || destination.name_km}" to itinerary!`
    );
    onClose();
  };

  const destName = km && destination.name_km ? destination.name_km : (destination.name_en || destination.name_km);
  const provName = destination.province ? (km && destination.province.name_km ? destination.province.name_km : destination.province.name_en) : null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-laterite-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 flex items-start justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-laterite-600/10 text-laterite-600 dark:text-amber-400 text-xs font-bold mb-1.5 font-khmer">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{km ? "កាលវិភាគដំណើរកម្សាន្ត" : "Trip Itinerary"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-black text-stone-950 dark:text-white tracking-tight">
              {km ? "បញ្ចូលក្នុងកាលវិភាគ" : "Add to Itinerary"}
            </h3>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mt-0.5">
              {destName} {provName ? `• ${provName}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="relative z-10 mt-5 space-y-4">
          {/* Plan Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-sans font-bold tracking-wider text-stone-700 dark:text-stone-300 uppercase">
                {km ? "ជ្រើសរើសគម្រោងដំណើរ" : "Select Trip"}
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-xs font-bold text-laterite-600 hover:text-laterite-700 dark:text-amber-400 cursor-pointer"
              >
                {isCreatingNew ? (km ? "ថយក្រោយ" : "Cancel") : (km ? "+ បង្កើតថ្មី" : "+ New Trip")}
              </button>
            </div>

            {isCreatingNew ? (
              <form onSubmit={handleCreateNewTrip} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder={km ? "ឈ្មោះដំណើរកម្សាន្តថ្មី..." : "Trip title..."}
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none focus:border-laterite-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-bold font-sans uppercase tracking-wider cursor-pointer"
                >
                  {km ? "បង្កើត" : "Create"}
                </button>
              </form>
            ) : (
              <select
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  setSelectedDay(1);
                }}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-laterite-600 focus:ring-1 focus:ring-laterite-600/20 cursor-pointer"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {km ? p.title : p.title_en || p.title} ({p.province || "កម្ពុជា"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Day Selector */}
          <div>
            <label className="text-xs font-sans font-bold tracking-wider text-stone-700 dark:text-stone-300 uppercase block mb-1.5">
              {km ? "ជ្រើសរើសថ្ងៃទស្សនា" : "Select Day"}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {daysList.map((d) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setSelectedDay(d.day)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedDay === d.day
                      ? "bg-laterite-600 text-white border-laterite-700 shadow-sm"
                      : "bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-laterite-600"
                  }`}
                >
                  {km ? `ថ្ងៃទី ${toKm(d.day)}` : `Day ${d.day}`}
                </button>
              ))}
            </div>
          </div>

          {/* Time & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-sans font-bold tracking-wider text-stone-700 dark:text-stone-300 uppercase block mb-1.5">
                {km ? "ម៉ោងគ្រោងទុក" : "Scheduled Time"}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 AM"
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm font-mono focus:outline-none focus:border-laterite-600 focus:ring-1 focus:ring-laterite-600/20"
              />
            </div>
            <div>
              <label className="text-xs font-sans font-bold tracking-wider text-stone-700 dark:text-stone-300 uppercase block mb-1.5">
                {km ? "កំណត់ចំណាំផ្ទាល់ខ្លួន" : "Personal Note"}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={km ? "ឧ. យកកាមេរ៉ា, ទិញសំបុត្រ..." : "e.g. Bring water..."}
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-laterite-600 focus:ring-1 focus:ring-laterite-600/20"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
          <Link
            to="/trip-planner"
            onClick={onClose}
            className="text-xs font-bold text-laterite-600 hover:text-laterite-700 dark:text-amber-400 font-sans uppercase tracking-wider"
          >
            {km ? "មើលកាលវិភាគពេញលេញ →" : "Open Itinerary →"}
          </Link>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-sans font-bold uppercase cursor-pointer transition-colors"
            >
              {km ? "បោះបង់" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="h-10 px-5 rounded-2xl bg-laterite-600 hover:bg-laterite-700 text-white text-xs font-sans font-bold uppercase shadow-sm hover:shadow-md cursor-pointer transition-all"
            >
              {km ? "បញ្ចូលក្នុងកាលវិភាគ" : "Add to Trip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};

export default AddToPlanModal;
