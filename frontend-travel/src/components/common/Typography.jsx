import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Heading Component
 * Strictly maps to the 3 heading tokens in the type scale:
 * - Level 1: Page title (one H1 per page) -> text-title (28px - 40px, weight 700)
 * - Level 2: Section title (H2) -> text-heading (24px - 32px, weight 700)
 * - Level 3: Card title, group label (H3) -> text-subheading (18px - 20px, weight 600)
 *
 * @param {1|2|3} level - Semantic & visual hierarchy level (defaults to 2)
 * @param {string} as - Semantic HTML tag override (default derived from level)
 * @param {string} className - Additional CSS classes
 */
export const Heading = ({
  level = 2,
  as,
  className = "",
  children,
  ...props
}) => {
  const { i18n } = useTranslation();
  const km = i18n.language === "km";

  const Tag = as || `h${level}`;

  const levelTokens = {
    1: "text-title font-bold",
    2: "text-heading font-bold",
    3: "text-subheading font-semibold"
  };

  const tokenClass = levelTokens[level] || levelTokens[2];
  const fontClass = km ? "font-km" : "font-heading";

  return (
    <Tag
      className={`${tokenClass} ${fontClass} text-stone-900 dark:text-stone-100 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

/**
 * Text Component
 * Strictly maps to the 2 body text tokens:
 * - variant="body": Paragraphs, descriptions, buttons, inputs (16px - 17px, weight 400)
 * - variant="small": Captions, dates, badges, helper text (14px floor, weight 400-500)
 *
 * @param {'body'|'small'} variant - Token variant
 * @param {string} as - Semantic HTML tag override (defaults to 'p' for body, 'span' for small)
 * @param {string} className - Additional CSS classes
 */
export const Text = ({
  variant = "body",
  as,
  className = "",
  children,
  ...props
}) => {
  const Tag = as || (variant === "small" ? "span" : "p");

  const variantClass = variant === "small"
    ? "text-small text-stone-600 dark:text-stone-400 font-normal"
    : "text-body text-stone-800 dark:text-stone-200 font-normal";

  return (
    <Tag className={`${variantClass} ${className}`} {...props}>
      {children}
    </Tag>
  );
};

/**
 * Prose Component
 * Standard reading container enforcing 65-75 characters per line (max-w-prose / 72ch)
 * and 1em paragraph vertical rhythm. Left-aligned by design.
 */
export const Prose = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`max-w-prose space-y-4 text-body text-stone-800 dark:text-stone-200 text-left ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default { Heading, Text, Prose };
