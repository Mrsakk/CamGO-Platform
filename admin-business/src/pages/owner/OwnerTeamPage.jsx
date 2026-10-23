import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  Loader2,
  Mail,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import api from "@/lib/axios";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { QueryError } from "@/components/common/QueryError";
import { toast } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

const roles = [
  {
    key: "owner",
    km: "ម្ចាស់អាជីវកម្ម",
    en: "Owner",
    kmDesc: "សិទ្ធិពេញលេញលើអាជីវកម្ម ក្រុមការងារ និងការទូទាត់",
    enDesc: "Full access to business, team, and billing",
  },
  {
    key: "manager",
    km: "អ្នកគ្រប់គ្រង",
    en: "Manager",
    kmDesc: "គ្រប់គ្រងព័ត៌មាន អតិថិជន និងការវាយតម្លៃ",
    enDesc: "Manage profile, leads, and reviews",
  },
  {
    key: "editor",
    km: "អ្នកកែសម្រួល",
    en: "Editor",
    kmDesc: "កែប្រែព័ត៌មាន និងរូបភាពអាជីវកម្ម",
    enDesc: "Edit profile content and photos",
  },
  {
    key: "viewer",
    km: "អ្នកមើល",
    en: "Viewer",
    kmDesc: "មើលស្ថិតិ និងការជូនដំណឹងតែប៉ុណ្ណោះ",
    enDesc: "View stats and notifications only",
  },
];

const statusMeta = {
  active: { km: "សកម្ម", en: "Active", className: "bg-emerald-500/10 text-emerald-600" },
  invited: { km: "បានអញ្ជើញ", en: "Invited", className: "bg-amber-500/10 text-amber-600" },
  suspended: { km: "ផ្អាក", en: "Suspended", className: "bg-rose-500/10 text-rose-600" },
};

export const OwnerTeamPage = () => {
  const { i18n } = useTranslation();
  const isKm = i18n.language === "km";
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "manager" });
  const [inviteResult, setInviteResult] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["owner-team"],
    queryFn: async () => {
      const res = await api.get("/business/owner/team");
      return res.data?.data || res.data;
    },
  });

  const members = Array.isArray(data) ? data : [];

  const invalidateTeam = () => queryClient.invalidateQueries({ queryKey: ["owner-team"] });

  const inviteMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/business/owner/team/invite", payload);
      return res.data?.data || res.data;
    },
    onSuccess: (result) => {
      toast.success(isKm ? "បានបង្កើតការអញ្ជើញ!" : "Invitation created!");
      setInviteResult(result);
      setInviteForm({ email: "", role: "manager" });
      setShowInvite(false);
      invalidateTeam();
    },
    onError: (error) => {
      const message =
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.message ||
        (isKm ? "មិនអាចអញ្ជើញបានទេ" : "Could not send invitation");
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/business/owner/team/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(isKm ? "បានធ្វើបច្ចុប្បន្នភាពសមាជិក!" : "Team member updated!");
      invalidateTeam();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Update failed"));
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/business/owner/team/${id}`);
    },
    onSuccess: () => {
      toast.success(isKm ? "បានដកសមាជិកចេញ!" : "Team member removed!");
      invalidateTeam();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || (isKm ? "បរាជ័យ" : "Remove failed"));
    },
  });

  const copyInviteLink = async (token) => {
    const link = `${window.location.origin}/accept-invite/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(isKm ? "បានចម្លងតំណអញ្ជើញ!" : "Invite link copied!");
    } catch {
      toast.info(link);
    }
  };

  const memberLabel = (member) => member.name || member.email;
  const roleLabel = (roleKey) => {
    const role = roles.find((item) => item.key === roleKey);
    return role ? (isKm ? role.km : role.en) : roleKey;
  };

  const requestRoleChange = (member, role) => {
    if (role === member.role) return;
    setConfirmAction({
      type: "role",
      member,
      role,
      title: isKm ? "បញ្ជាក់ការផ្លាស់ប្តូរតួនាទី" : "Confirm role change",
      description: isKm
        ? `ផ្លាស់ប្តូរ ${memberLabel(member)} ទៅជា “${roleLabel(role)}”? សិទ្ធិរបស់ពួកគេនឹងផ្លាស់ប្តូរភ្លាមៗ។`
        : `Change ${memberLabel(member)} to “${roleLabel(role)}”? Their access will update immediately.`,
    });
  };

  const requestStatusToggle = (member) => {
    const nextStatus = member.status === "active" ? "suspended" : "active";
    setConfirmAction({
      type: "status",
      member,
      status: nextStatus,
      title:
        nextStatus === "suspended"
          ? isKm
            ? "បញ្ជាក់ការផ្អាកសមាជិក"
            : "Confirm member suspension"
          : isKm
            ? "បញ្ជាក់ការសកម្មសមាជិក"
            : "Confirm member activation",
      description:
        nextStatus === "suspended"
          ? isKm
            ? `${memberLabel(member)} នឹងបាត់សិទ្ធិចូលប្រើផ្ទាំងអាជីវកម្មភ្លាមៗ។`
            : `${memberLabel(member)} will lose access to the business portal immediately.`
          : isKm
            ? `${memberLabel(member)} នឹងអាចចូលប្រើផ្ទាំងអាជីវកម្មវិញ។`
            : `${memberLabel(member)} will regain access to the business portal.`,
    });
  };

  const requestRemove = (member) => {
    setConfirmAction({
      type: "remove",
      member,
      title: isKm ? "បញ្ជាក់ការដកសមាជិក" : "Confirm member removal",
      description: isKm
        ? `${memberLabel(member)} នឹងត្រូវដកចេញពីក្រុមការងារ និងបាត់សិទ្ធិទាំងអស់។`
        : `${memberLabel(member)} will be removed from the team and lose all access.`,
    });
  };

  const runConfirmedAction = () => {
    if (!confirmAction) return;
    const clear = () => setConfirmAction(null);

    if (confirmAction.type === "role") {
      updateMutation.mutate(
        { id: confirmAction.member.id, payload: { role: confirmAction.role } },
        { onSettled: clear }
      );
      return;
    }

    if (confirmAction.type === "status") {
      updateMutation.mutate(
        { id: confirmAction.member.id, payload: { status: confirmAction.status } },
        { onSettled: clear }
      );
      return;
    }

    removeMutation.mutate(confirmAction.member.id, { onSettled: clear });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setInviteResult(null);
              setShowInvite(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {isKm ? "អញ្ជើញសមាជិក" : "Invite member"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {roles.map((role) => (
          <div key={role.key} className="p-4 rounded-2xl bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2 font-bold text-sm text-stone-900 dark:text-white">
              <Shield className="w-4 h-4 text-amber-500" />
              {isKm ? role.km : role.en}
            </div>
            <p className="mt-1.5 text-[11px] text-stone-500 leading-relaxed">
              {isKm ? role.kmDesc : role.enDesc}
            </p>
          </div>
        ))}
      </div>

      {inviteResult?.invite_token && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {isKm ? "តំណអញ្ជើញត្រូវបានបង្កើត" : "Invitation link created"}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              {isKm
                ? "ផ្ញើតំណនេះទៅសមាជិក។ ពួកគេត្រូវចូលគណនីដែលមានអ៊ីមែលនេះជាមុន។"
                : "Send this link to the member. They must sign in with the invited email first."}
            </p>
          </div>
          <button
            onClick={() => copyInviteLink(inviteResult.invite_token)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0"
          >
            <Copy className="w-4 h-4" />
            {isKm ? "ចម្លងតំណ" : "Copy link"}
          </button>
        </div>
      )}

      {isError ? (
        <QueryError onRetry={refetch} isRetrying={isFetching} />
      ) : isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          {isKm ? "កំពុងផ្ទុកក្រុមការងារ..." : "Loading team..."}
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-850 border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {members.map((member) => {
              const status = statusMeta[member.status] || statusMeta.invited;
              const isSelf = member.user_id === user?.id;
              return (
                <div key={member.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-extrabold shrink-0">
                      {(member.name || member.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 dark:text-white truncate">
                          {member.name || member.email}
                        </span>
                        {isSelf && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold">
                            {isKm ? "អ្នក" : "You"}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.className}`}>
                          {isKm ? status.km : status.en}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-stone-500 mt-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <select
                      value={member.role}
                      onChange={(event) => requestRoleChange(member, event.target.value)}
                      disabled={updateMutation.isPending || isSelf}
                      className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-semibold disabled:opacity-50"
                    >
                      {roles.map((role) => (
                        <option key={role.key} value={role.key}>
                          {isKm ? role.km : role.en}
                        </option>
                      ))}
                    </select>

                    {member.status === "invited" && member.invited_at ? (
                      <span className="text-[10px] text-stone-400">
                        {isKm ? "រង់ចាំទទួលយក" : "Awaiting acceptance"}
                      </span>
                    ) : (
                      <button
                        onClick={() => requestStatusToggle(member)}
                        disabled={updateMutation.isPending || (isSelf && member.status === "active")}
                        className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 disabled:opacity-40"
                      >
                        {member.status === "active"
                          ? isKm ? "ផ្អាក" : "Suspend"
                          : isKm ? "សកម្ម" : "Activate"}
                      </button>
                    )}

                    <button
                      onClick={() => requestRemove(member)}
                      disabled={isSelf || removeMutation.isPending}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-30"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-850 rounded-3xl p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
            <div>
              <h3 className="font-extrabold text-lg text-stone-900 dark:text-white">
                {isKm ? "អញ្ជើញសមាជិកថ្មី" : "Invite a team member"}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isKm
                  ? "បុគ្គលិកត្រូវមានគណនីរួចហើយ មុនពេលអញ្ជើញ។"
                  : "The team member must already have an account before you invite them."}
              </p>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-stone-500 uppercase">Email</span>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })}
                placeholder="staff@example.com"
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-sm"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-stone-500 uppercase">
                {isKm ? "តួនាទី" : "Role"}
              </span>
              <select
                value={inviteForm.role}
                onChange={(event) => setInviteForm({ ...inviteForm, role: event.target.value })}
                className="w-full rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-2.5 text-sm"
              >
                {roles.filter((role) => role.key !== "owner").map((role) => (
                  <option key={role.key} value={role.key}>
                    {isKm ? role.km : role.en} — {isKm ? role.kmDesc : role.enDesc}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500"
              >
                {isKm ? "បិទ" : "Cancel"}
              </button>
              <button
                onClick={() => inviteMutation.mutate(inviteForm)}
                disabled={inviteMutation.isPending || !inviteForm.email.trim()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isKm ? "បង្កើតការអញ្ជើញ" : "Create invitation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.title}
        description={confirmAction?.description}
        tone={
          confirmAction?.type === "remove" || confirmAction?.status === "suspended"
            ? "danger"
            : "warning"
        }
        confirmLabel={
          confirmAction?.type === "remove"
            ? isKm
              ? "ដកចេញ"
              : "Remove"
            : isKm
              ? "បញ្ជាក់"
              : "Confirm"
        }
        isPending={updateMutation.isPending || removeMutation.isPending}
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
