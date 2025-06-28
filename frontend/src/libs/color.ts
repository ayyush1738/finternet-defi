// utils/color.ts

// List of pastel / vibrant colors
export const colorPalette: string[] = [
  '#F87171', // Red
  '#60A5FA', // Blue
  '#34D399', // Green
  '#FBBF24', // Yellow
  '#A78BFA', // Purple
  '#F472B6', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Indigo
];

/**
 * Generates or retrieves a consistent color for a given wallet address.
 * Uses localStorage for persistence across reloads.
 * 
 * @param walletAddress - Solana wallet address
 * @returns Hex color string
 */
export function getColorForWallet(walletAddress: string): string {
  const key = `walletColor_${walletAddress}`;
  let storedColor = localStorage.getItem(key);

  if (!storedColor) {
    const hash = walletAddress
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const color = colorPalette[hash % colorPalette.length];
    localStorage.setItem(key, color);
    return color;
  }

  return storedColor;
}
