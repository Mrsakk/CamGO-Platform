import { useState } from "react";
import { Check, Trash2, Eye, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "@/store/toastStore";

const AdminContactPage = () => {
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { data: contactsRes, isLoading } = useQuery({
    queryKey: queryKeys.contactMessages.all(),
    queryFn: () => adminApi.getContacts(),
  });

  const messages = contactsRes?.data?.items || (Array.isArray(contactsRes?.data) ? contactsRes.data : []);

  const handleMarkRead = async (id) => {
    try {
      await adminApi.markContactRead(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages.all() });
      toast.success("Marked as read");
    } catch (err) {
      toast.error("Failed to mark read");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await adminApi.deleteContact(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.contactMessages.all() });
      toast.success("Message deleted");
    } catch (err) {
      toast.error("Failed to delete message");
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 dark:text-white">
          Contact Messages Inbox
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Inquiries and feedback submitted by travelers and potential business partners
        </p>
      </div>

      <div className="bg-white dark:bg-stone-100 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm divide-y divide-stone-100 dark:divide-stone-800">
        {isLoading ? <div className="p-8 text-center text-stone-400">Loading inbox...</div> : messages.length === 0 ? <div className="p-12 text-center text-stone-400 text-xs">No contact messages received yet</div> : messages.map((msg) => <div
    key={msg.id}
    className={`p-5 flex items-start justify-between gap-4 transition-colors ${!msg.is_read ? "bg-amber-50/40 dark:bg-amber-950/20" : ""}`}
  >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!msg.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                  <span className="font-bold text-sm text-stone-900 dark:text-white truncate">
                    {msg.name}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">({msg.email})</span>
                  {msg.phone && <span className="text-xs text-teal-600 font-mono">• {msg.phone}</span>}
                </div>

                {msg.subject && <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-700">
                    Subject: {msg.subject}
                  </h4>}

                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                  {msg.message}
                </p>

                <span className="text-small text-stone-400 block pt-1">
                  Received: {msg.created_at?.substring(0, 16)}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
    onClick={() => {
      setSelectedMessage(msg);
      if (!msg.is_read) handleMarkRead(msg.id);
    }}
    className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
    title="View details"
  >
                  <Eye className="w-4 h-4" />
                </button>
                {!msg.is_read && <button
    onClick={() => handleMarkRead(msg.id)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800"
    title="Mark as read"
  >
                    <Check className="w-4 h-4" />
                  </button>}
                <button
    onClick={() => handleDelete(msg.id)}
    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
    title="Delete message"
  >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>)}
      </div>

      {
    /* Message View Modal */
  }
      {selectedMessage && <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 relative space-y-4">
            <button
    onClick={() => setSelectedMessage(null)}
    className="absolute top-5 right-5 text-stone-400 hover:text-stone-700"
  >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 dark:text-white">
              Message from {selectedMessage.name}
            </h3>

            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800 space-y-1 text-xs text-stone-600 dark:text-stone-700">
              <p><strong>Email:</strong> {selectedMessage.email}</p>
              {selectedMessage.phone && <p><strong>Phone:</strong> {selectedMessage.phone}</p>}
              {selectedMessage.subject && <p><strong>Subject:</strong> {selectedMessage.subject}</p>}
              <p><strong>Date:</strong> {selectedMessage.created_at}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">
                Message Body
              </label>
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-xs sm:text-sm text-stone-800 dark:text-stone-700 whitespace-pre-line leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex justify-end">
              <a
    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your inquiry on CamGO"}`}
    className="px-5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
  >
                Reply by Email
              </a>
            </div>
          </div>
        </div>}
    </div>;
};
export {
  AdminContactPage
};
