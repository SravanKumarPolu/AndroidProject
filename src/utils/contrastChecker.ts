/**
 * WCAG 2.2 Contrast Ratio Calculator and Accessibility Checker
 * 
 * WCAG 2.2 Requirements:
 * - Level AA: 
 *   - Normal text (16px+): 4.5:1 contrast ratio
 *   - Large text (18px+ bold, 24px+ regular): 3:1 contrast ratio
 *   - UI components and graphics: 3:1 contrast ratio
 * - Level AAA:
 *   - Normal text: 7:1 contrast ratio
 *   - Large text: 4.5:1 contrast ratio
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle shorthand hex (e.g., #FFF)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    return null;
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Calculate relative luminance of a color (WCAG formula)
 * Based on sRGB color space
 */
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  // Convert to 0-1 range
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1:1 and 21:1
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    return 0;
  }
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  // Add 0.05 to avoid division by zero
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG 2.2 Level AA requirements
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (isLargeText) {
    return ratio >= 3.0; // AA large text
  }
  
  return ratio >= 4.5; // AA normal text
}

/**
 * Check if contrast meets WCAG 2.2 Level AAA requirements
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (isLargeText) {
    return ratio >= 4.5; // AAA large text
  }
  
  return ratio >= 7.0; // AAA normal text
}

/**
 * Get accessibility status for a color combination
 */
export function getAccessibilityStatus(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  level: 'fail' | 'aa' | 'aaa';
} {
  const ratio = getContrastRatio(foreground, background);
  const aa = meetsWCAGAA(foreground, background, isLargeText);
  const aaa = meetsWCAGAAA(foreground, background, isLargeText);
  
  let level: 'fail' | 'aa' | 'aaa' = 'fail';
  if (aaa) {
    level = 'aaa';
  } else if (aa) {
    level = 'aa';
  }
  
  return { ratio, aa, aaa, level };
}

/**
 * Find the closest accessible color by adjusting brightness
 */
export function findAccessibleColor(
  foreground: string,
  background: string,
  targetRatio: number = 4.5,
  maxIterations: number = 20
): string | null {
  const rgb = hexToRgb(foreground);
  if (!rgb) return null;
  
  const currentRatio = getContrastRatio(foreground, background);
  
  if (currentRatio >= targetRatio) {
    return foreground;
  }
  
  // Determine if we need to lighten or darken
  const bgRgb = hexToRgb(background);
  if (!bgRgb) return null;
  
  const fgLum = getRelativeLuminance(rgb);
  const bgLum = getRelativeLuminance(bgRgb);
  
  const needsDarkening = fgLum > bgLum;
  
  // Adjust color to reach target ratio
  let adjusted = { ...rgb };
  let iterations = 0;
  
  while (iterations < maxIterations) {
    const testColor = `#${[adjusted.r, adjusted.g, adjusted.b]
      .map(val => Math.round(Math.max(0, Math.min(255, val))))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('')}`;
    
    const ratio = getContrastRatio(testColor, background);
    
    if (ratio >= targetRatio) {
      return testColor;
    }
    
    // Adjust brightness
    if (needsDarkening) {
      adjusted.r = Math.max(0, adjusted.r - 10);
      adjusted.g = Math.max(0, adjusted.g - 10);
      adjusted.b = Math.max(0, adjusted.b - 10);
    } else {
      adjusted.r = Math.min(255, adjusted.r + 10);
      adjusted.g = Math.min(255, adjusted.g + 10);
      adjusted.b = Math.min(255, adjusted.b + 10);
    }
    
    iterations++;
  }
  
  return null;
}

/**
 * Generate accessibility report for multiple color pairs
 */
export interface ColorPair {
  foreground: string;
  background: string;
  context: string;
  isLargeText?: boolean;
}

export interface AccessibilityReport {
  pair: ColorPair;
  ratio: number;
  aa: boolean;
  aaa: boolean;
  level: 'fail' | 'aa' | 'aaa';
  suggestedForeground?: string;
  suggestedBackground?: string;
}

export function generateAccessibilityReport(pairs: ColorPair[]): AccessibilityReport[] {
  return pairs.map(pair => {
    const status = getAccessibilityStatus(
      pair.foreground,
      pair.background,
      pair.isLargeText
    );
    
    let suggestedForeground: string | undefined;
    let suggestedBackground: string | undefined;
    
    if (status.level === 'fail') {
      // Try to find accessible foreground
      const targetRatio = pair.isLargeText ? 3.0 : 4.5;
      suggestedForeground = findAccessibleColor(
        pair.foreground,
        pair.background,
        targetRatio
      ) || undefined;
      
      // If foreground adjustment doesn't work, try background
      if (!suggestedForeground) {
        suggestedBackground = findAccessibleColor(
          pair.background,
          pair.foreground,
          targetRatio
        ) || undefined;
      }
    }
    
    return {
      pair,
      ...status,
      suggestedForeground,
      suggestedBackground,
    };
  });
}

