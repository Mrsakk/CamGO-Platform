import { useState } from "react";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/utils";

/**
 * TeamMemberCard — 100% Icon-Free Cultural Showcase Card
 * Powered by real database records from team_members table
 */
export const TeamMemberCard = ({ member, index = 0, km = true }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const memberName = km && member?.name_km ? member.name_km : (member?.name_en || member?.name_km || "");
  const memberRole = km && member?.role_km ? member.role_km : (member?.role_en || member?.role_km || "");
  const rawImage = member?.image || member?.image_url;
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80";
  const avatar = getImageUrl(rawImage, DEFAULT_AVATAR);

  const memberIndexStr = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      className="group relative rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 p-3 sm:p-3.5 shadow-sm hover:shadow-md hover:border-laterite-500/60 transition-all duration-300 flex flex-col justify-between overflow-hidden select-none h-full"
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
    >
      {/* Top Media Canvas */}
      <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700/80 shadow-2xs">
        <img
          src={avatar}
          alt={memberName}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_AVATAR) {
              e.currentTarget.src = DEFAULT_AVATAR;
            } else {
              setImageError(true);
            }
          }}
          className={`w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-103 ${imageLoaded ? "opacity-100" : "opacity-90"}`}
        />

        {/* Top Index Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-stone-900/85 backdrop-blur-xs text-white font-mono text-[10px] font-bold tracking-wider shadow-2xs">
            #{memberIndexStr}
          </span>
        </div>
      </div>

      {/* Member Details Content Block */}
      <div className="pt-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          {/* Member Name in Koulen */}
          <h3 className="font-heading font-bold text-lg sm:text-xl text-stone-900 dark:text-stone-100 group-hover:text-laterite-600 transition-colors duration-200 leading-snug tracking-wide">
            {memberName}
          </h3>

          {/* Role Credential Tag */}
          {memberRole && (
            <div className="inline-block w-full px-2.5 py-1 rounded-lg bg-laterite-600/10 border border-laterite-600/20 text-laterite-700 dark:text-laterite-400 text-xs font-semibold">
              <span className="break-words">{memberRole}</span>
            </div>
          )}
        </div>

        {/* Card Footer Accent */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span className="font-sans font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider text-[10px]">
            {km ? "អ្នកជំនាញ" : "Expert"}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-stone-400 uppercase">
            CAMGO
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;
