import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  CheckCheck,
  CreditCard,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Save,
  Send,
  Star,
} from "lucide-react";
import api from "@/lib/axios";
import { QueryError } from "@/components/common/QueryError";
import { toast } from "@/store/toastStore";

const getNotificationIcon = (type) => {
  if (type?.includes("review")) return Star;
  if (type?.includes("lead") || type?.includes("contact")) return MessageSquare;
  if (type?.includes("subscription") || type?.includes("billing") || type?.includes("trial")) return CreditCard;
  return Bell;
};

const getNotificationLink = (notification) => {
  const type = notification?.type || "";
  if (type.includes("review")) return "/owner/reviews";
  if (type.includes("lead") || type.includes("contact")) return "/owner/leads";
  if (type.includes("subscription") || type.includes("billing") || type.includes("trial")) {
    return "/owner/subscription";
  }
  return null;
};

const formatDate = (value, isKm) => {
  if (!value) return "—";
  return new Date(value).toLocaleString(isKm ? "km-KH" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const preferenceRows = [
  { key: "in_app", km: "ការជូនដំណឹងក្នុងប្រព័ន្ធ", en: "In-app notifications" },
  { key: "telegram", km: "ផ្ញើតាម Telegram", en: "Telegram notifications" },
  { key: "leads", km: "អតិថិជនថ្មី", en: "New customer leads" },
  { key: "reviews", km: "ការវាយតម្លៃថ្មី", en: "New reviews" },
  { key: "billing", km: "ការជាវ និងការទូទាត់", en: "Billing & subscription" },
];

export const OwnerNotificationsPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [preferences, setPreferences] = useState({
    in_app: true,
    telegram: false,
    leads: true,
    reviews: true,
    billing: true,
  });
  const [telegramChatId, setTelegramChatId] = useState("");

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["owner-notifications", unreadOnly, page],
    queryFn: async () => {
      const res = await api.get("/business/owner/notifications", {
        params: { page, per_page: 20, unread: unreadOnly || undefined },
      });
      return res.data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["owner-notification-settings"],
    queryFn: async () => {
      const res = await api.get("/business/owner/notifications/settings");
      return res.data?.data || res.data;
    },
  });

  useEffect(() => {
    if (settings?.notification_preferences) {
      setPreferences((current) => ({ ...current, ...settings.notification_preferences }));
    }
    setTelegramChatId(settings?.telegram_chat_id || "");
  }, [settings]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["owner-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["owner-unread-notifications"] });
  };

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/business/owner/notifications/${id}/read`);
    },
    onSuccess: invalidate,
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await api.post("/business/owner/notifications/read-all");
    },
    onSuccess: () => {
      toast.success(isKm ? "បានសម្គាល់ថាបានអានទាំងអស់!" : "All notifications marked as read!");
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["owner-notification-settings"] });
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put("/business/owner/notifications/settings", {
        telegram_chat_id: telegramChatId.trim() || null,
        notification_preferences: preferences,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានរក្សាទុកការកំណត់ជូនដំណឹង!" : "Notification settings saved!");
      queryClient.invalidateQueries({ queryKey: ["owner-notification-settings"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
        (isKm ? "មិនអាចរក្សាទុកបានទេ" : "Could not save settings")
      );
    },
  });

  const notifications = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta || {};

  const handleNotificationClick = (notification) => {
    if (!notification.read_at) {
      markReadMutation.mutate(notification.id);
    }

    const link = getNotificationLink(notification);
    if (link) navigate(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUnreadOnly(false);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${!unreadOnly
                ? "bg-amber-500 text-stone-950 border-amber-500"
                : "bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
            >
              {isKm ? "ទាំងអស់" : "All"}
            </button>
            <button
              onClick={() => {
                setUnreadOnly(true);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${unreadOnly
                ? "bg-amber-500 text-stone-950 border-amber-500"
                : "bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400"
                }`}
            >
              {isKm ? "មិនទាន់អាន" : "Unread"}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                {isKm ? "អានទាំងអស់" : "Mark all read"}
              </button>
            </div>
          </div>

          {isError ? (
            <QueryError onRetry={refetch} isRetrying={isFetching} />
          ) : isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              {isKm ? "កំពុងផ្ទុកការជូនដំណឹង..." : "Loading notifications..."}
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-850 p-12 text-center space-y-2">
              <Bell className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
              <h3 className="font-bold text-stone-900 dark:text-white">
                {isKm ? "មិនមានការជូនដំណឹងទេ" : "No notifications"}
              </h3>
              <p className="text-xs text-stone-500">
                {isKm ? "អ្នកនឹងឃើញព័ត៌មានថ្មីៗនៅទីនេះ។" : "New updates will appear here."}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const isUnread = !notification.read_at;
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 sm:p-5 flex items-start gap-3 transition hover:bg-stone-50 dark:hover:bg-stone-800/50 ${isUnread ? "bg-amber-50/50 dark:bg-amber-950/10" : ""
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUnread
                        ? "bg-amber-500/15 text-amber-600"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                        }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-sm ${isUnread ? "font-extrabold" : "font-semibold"} text-stone-900 dark:text-white`}>
                            {isKm
                              ? notification.title_km || notification.title_en
                              : notification.title_en || notification.title_km}
                          </span>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />}
                        </div>
                        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                          {isKm
                            ? notification.body_km || notification.body_en
                            : notification.body_en || notification.body_km}
                        </p>
                        <div className="mt-1.5 text-[10px] text-stone-400">
                          {formatDate(notification.created_at, isKm)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500">
                <span>{isKm ? `សរុប ${meta.total || 0}` : `${meta.total || 0} total`}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 font-semibold"
                  >
                    {isKm ? "មុន" : "Prev"}
                  </button>
                  <span>{meta.current_page || 1} / {meta.last_page || 1}</span>
                  <button
                    disabled={!meta.has_more_pages}
                    onClick={() => setPage((value) => value + 1)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-40 font-semibold"
                  >
                    {isKm ? "បន្ទាប់" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                {isKm ? "ការកំណត់ជូនដំណឹង" : "Notification settings"}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isKm ? "ជ្រើសរើសប្រភេទព័ត៌មានដែលអ្នកចង់ទទួល។" : "Choose which updates you want to receive."}
              </p>
            </div>

            <div className="space-y-2">
              {preferenceRows.map((row) => (
                <label key={row.key} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {isKm ? row.km : row.en}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(preferences[row.key])}
                    onChange={(event) =>
                      setPreferences({ ...preferences, [row.key]: event.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-500"
                  />
                </label>
              ))}
            </div>

            <label className="block space-y-1.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Telegram Chat ID
              </span>
              <input
                type="text"
                value={telegramChatId}
                onChange={(event) => setTelegramChatId(event.target.value)}
                placeholder="e.g. 123456789"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-xs"
              />
              <span className="block text-[10px] text-stone-400 leading-snug">
                {isKm
                  ? "ផ្ញើ /start ទៅ bot របស់យើង ដើម្បីទទួលបាន Chat ID របស់អ្នក។"
                  : "Send /start to our bot to get your chat ID."}
              </span>
            </label>

            <button
              onClick={() => settingsMutation.mutate()}
              disabled={settingsMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {settingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isKm ? "រក្សាទុកការកំណត់" : "Save settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
