/**
 * Centralized styles for consistent UI patterns across the application
 * Uses Tailwind CSS classes
 */

// Card styles
export const cardStyles = {
  base: 'rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative',
  content: 'p-4',
  title: 'font-semibold text-lg truncate',
  subtitle: 'text-sm text-gray-500 mt-1',
  metaText: 'text-xs text-gray-500',
  metaSection: 'mt-2 text-xs text-gray-500 border-t pt-2',
  metaGrid: 'flex justify-between items-center mt-2 text-xs text-gray-500',
};

// Button styles are handled by the Button component, but these are for direct class use
export const buttonStyles = {
  iconButton: 'p-2 rounded-full shadow-md transition-colors duration-200',
  saveButton: 'bg-blue-500 hover:bg-blue-600 text-white',
  removeButton: 'bg-red-500 hover:bg-red-600 text-white',
  disabled: 'opacity-50 cursor-not-allowed',
};

// Thumbnail and media styles
export const mediaStyles = {
  thumbnail: 'relative h-48 w-full cursor-pointer',
  thumbnailFallback: 'h-full w-full bg-gray-200 flex items-center justify-center',
  thumbnailFallbackText: 'text-gray-500',
};

// Layout styles
export const layoutStyles = {
  container: 'container mx-auto px-4',
  section: 'mb-8',
  sectionHeader: 'text-xl font-semibold mb-4 border-b pb-2',
  panel: 'bg-gray-100 p-4 rounded-lg shadow-sm',
};

// Navigation styles
export const navStyles = {
  container: 'bg-gray-900 text-white shadow-md',
  innerContainer: 'container mx-auto px-4 py-3',
  tabActive: 'text-blue-400 border-blue-400',
  tabInactive: 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-400',
  tabBase: 'px-4 py-1 text-sm font-medium transition-all duration-200 border-b-2',
};

// Common animations
export const animationStyles = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  fadeIn: 'animate-fadeIn',
};

// Form element styles
export const formStyles = {
  input: 'bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all',
  select: 'bg-gray-800 text-white text-sm rounded-md px-3 py-2 pr-8 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all cursor-pointer hover:bg-gray-700',
  // We include a separate class to normalize styling across browsers
  selectNormalized: 'appearance-none -webkit-appearance-none -moz-appearance-none',
  // Documentation for select style (we need to use inline styles due to type constraints)
  // style={{
  //   WebkitAppearance: "none",
  //   MozAppearance: "none", 
  //   appearance: "none",
  //   backgroundColor: "#1f2937", // bg-gray-800
  //   color: "white"
  // }}
};

// Common color styles
export const colorStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
  info: 'bg-sky-500 text-white hover:bg-sky-600',
};

// Text styles
export const textStyles = {
  title: 'text-2xl font-bold',
  subtitle: 'text-xl font-semibold',
  bodyLarge: 'text-base',
  body: 'text-sm',
  small: 'text-xs',
  muted: 'text-gray-500',
  error: 'text-red-600',
  truncate: 'truncate',
  multiLineTruncate: 'line-clamp-2',
};

export default {
  card: cardStyles,
  button: buttonStyles,
  media: mediaStyles,
  layout: layoutStyles,
  nav: navStyles,
  animation: animationStyles,
  form: formStyles,
  color: colorStyles,
  text: textStyles,
};