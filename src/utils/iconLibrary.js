// src/utils/iconLibrary.js
/**
 * Configuration and utilities for FontAwesome icons across the TakeNeuroIQ project.
 * 
 * To enable FontAwesome Pro Sharp Duotone icons, ensure you have:
 * 1. Your FontAwesome token in .npmrc
 * 2. Installed the @fortawesome/fa-sharp-duotone package
 */

export const ICON_COLORS = {
  primary: '#22d3ee',   // Bright Cyan (Tailwind cyan-400)
  secondary: '#d946ef', // Bright Magenta (Tailwind fuchsia-500)
};

/**
 * Common FontAwesomeIcon props for the project's duotone theme.
 * Use this as a spread prop on <FontAwesomeIcon />
 */
export const DUOTONE_PROPS = {
  'primary-color': ICON_COLORS.primary,
  'secondary-color': ICON_COLORS.secondary,
  'primary-opacity': 1,
  'secondary-opacity': 0.6,
};

// Alternative for CSS-based styling
export const getDuotoneStyle = (primary = ICON_COLORS.primary, secondary = ICON_COLORS.secondary) => ({
  '--fa-primary-color': primary,
  '--fa-secondary-color': secondary,
  '--fa-primary-opacity': 1,
  '--fa-secondary-opacity': 0.6,
});
