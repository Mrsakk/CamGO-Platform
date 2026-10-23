/**
 * PageContainer Component
 * Provides standard max-w-7xl container with 8px-scale responsive horizontal padding.
 * Padding: 16px (px-4) mobile, 24px (sm:px-6) tablet, 32px (lg:px-8) desktop.
 */
export const PageContainer = ({ children, className = "", id }) => {
  return (
    <div id={id} className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {children}
    </div>
  );
};
