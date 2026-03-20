import { useTheme } from '../contexts/ThemeContext';

/**
 * Returns a dark-mode-aware color palette for the grocery module.
 * Grocery components use inline styles, so they can't rely on Tailwind dark: variants.
 */
export function useGroceryTheme() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return {
    // Text colors
    text: isDark ? '#e2e8f0' : '#282627',
    textMuted: isDark ? '#94a3b8' : '#6B5B4F',
    textSubtle: isDark ? '#64748b' : '#9DAFD0',

    // Backgrounds
    bg: isDark ? '#0f1219' : '#FDFBF7',
    bgCard: isDark ? '#1e293b' : '#fff',
    bgHeader: isDark ? 'rgba(15, 18, 25, 0.85)' : 'rgba(253,251,247,0.85)',
    bgInput: isDark ? '#1e293b' : '#FDFBF7',
    bgHover: isDark ? 'rgba(74,55,40,0.12)' : 'rgba(74,55,40,0.04)',
    bgSelected: isDark ? 'rgba(74,55,40,0.15)' : 'rgba(74,55,40,0.04)',
    bgError: isDark ? 'rgba(220, 38, 38, 0.12)' : '#fef2f2',

    // Borders
    border: isDark ? 'rgba(51, 65, 85, 0.5)' : '#E8DED1',
    borderLight: isDark ? 'rgba(51, 65, 85, 0.3)' : '#f5f0ea',
    borderInput: isDark ? 'rgba(51, 65, 85, 0.4)' : '#f0ebe4',
    borderCard: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(232,222,209,0.6)',

    // Accent colors (brown theme)
    accent: isDark ? '#C4A882' : '#4A3728',
    accentText: '#fff',
    accentGold: '#C4A882',

    // Button variants
    btnActiveBg: isDark ? '#C4A882' : '#4A3728',
    btnActiveText: isDark ? '#0f1219' : '#fff',
    btnInactiveBg: isDark ? '#1e293b' : '#fff',
    btnInactiveText: isDark ? '#94a3b8' : '#6B5B4F',

    // Chart / tooltip
    tooltipBg: isDark ? '#1e293b' : '#fff',
    gridStroke: isDark ? 'rgba(51, 65, 85, 0.4)' : '#E8DED1',
    axisStroke: isDark ? 'rgba(51, 65, 85, 0.5)' : '#E8DED1',
    axisFill: isDark ? '#94a3b8' : '#6B5B4F',
  };
}
