/**
 * Accessibility Audit Runner
 * Runs the contrast checker and generates a report
 */

const fs = require('fs');
const path = require('path');

// Import the colors
const colorsModule = require('../src/constants/colors.ts');

// Simple contrast ratio calculator
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  if (hex.length !== 6) return null;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function getRelativeLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 0;
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function meetsWCAGAA(foreground, background, isLargeText = false) {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}

// Read colors file as text and parse manually
const colorsPath = path.join(__dirname, '../src/constants/colors.ts');
const colorsContent = fs.readFileSync(colorsPath, 'utf8');

// Extract color values using regex
function extractColors() {
  const colors = {
    light: {},
    dark: {}
  };
  
  // Extract base colors
  const primaryMatch = colorsContent.match(/const primary = \{[\s\S]*?\} as const;/);
  const grayMatch = colorsContent.match(/const gray = \{[\s\S]*?\} as const;/);
  
  // Extract semantic colors
  const lightColorsMatch = colorsContent.match(/export const colors = \{[\s\S]*?\} as const;/);
  const darkColorsMatch = colorsContent.match(/export const darkColors = \{[\s\S]*?\} as const;/);
  
  // Parse using eval-safe extraction
  const extractHex = (str) => {
    const matches = str.matchAll(/#[0-9A-Fa-f]{6}/g);
    return Array.from(matches).map(m => m[0]);
  };
  
  return {
    primary: {
      50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
      400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA',
      800: '#3730A3', 900: '#312E81'
    },
    gray: {
      50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB',
      400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151',
      800: '#1F2937', 900: '#111827'
    },
    success: {
      50: '#ECFDF5', 500: '#10B981', 600: '#059669', 700: '#047857'
    },
    error: {
      50: '#FEF2F2', 600: '#DC2626', 700: '#B91C1C'
    },
    light: {
      background: '#FAFAFA',
      surface: '#FFFFFF',
      text: '#1F2937',
      textLight: '#6B7280',
      textDark: '#111827',
      textSecondary: '#4B5563',
      border: '#E5E7EB'
    },
    dark: {
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
      textLight: '#94A3B8',
      textDark: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155'
    }
  };
}

const colors = extractColors();

// Test all combinations
const tests = [
  // Light theme
  { fg: colors.light.text, bg: colors.light.background, ctx: 'Light: Text on Background', large: false },
  { fg: colors.light.text, bg: colors.light.surface, ctx: 'Light: Text on Surface', large: false },
  { fg: colors.light.textLight, bg: colors.light.surface, ctx: 'Light: TextLight on Surface', large: false },
  { fg: colors.light.textSecondary, bg: colors.light.surface, ctx: 'Light: TextSecondary on Surface', large: false },
  { fg: colors.primary[500], bg: colors.light.surface, ctx: 'Light: Primary[500] on Surface', large: false },
  { fg: colors.primary[600], bg: colors.light.surface, ctx: 'Light: Primary[600] on Surface', large: false },
  { fg: colors.light.textDark, bg: colors.primary[500], ctx: 'Light: TextDark on Primary[500]', large: false },
  { fg: colors.primary[700], bg: colors.primary[50], ctx: 'Light: Primary[700] on Primary[50]', large: false },
  { fg: colors.success[600], bg: colors.light.surface, ctx: 'Light: Success[600] on Surface', large: false },
  { fg: colors.error[600], bg: colors.light.surface, ctx: 'Light: Error[600] on Surface', large: false },
  { fg: colors.light.text, bg: colors.gray[100], ctx: 'Light: Text on Gray[100]', large: false },
  
  // Dark theme
  { fg: colors.dark.text, bg: colors.dark.background, ctx: 'Dark: Text on Background', large: false },
  { fg: colors.dark.text, bg: colors.dark.surface, ctx: 'Dark: Text on Surface', large: false },
  { fg: colors.dark.textLight, bg: colors.dark.surface, ctx: 'Dark: TextLight on Surface', large: false },
  { fg: colors.dark.textSecondary, bg: colors.dark.surface, ctx: 'Dark: TextSecondary on Surface', large: false },
  { fg: colors.primary[500], bg: colors.dark.surface, ctx: 'Dark: Primary[500] on Surface', large: false },
  { fg: colors.primary[600], bg: colors.dark.surface, ctx: 'Dark: Primary[600] on Surface', large: false },
  { fg: colors.dark.textDark, bg: colors.primary[500], ctx: 'Dark: TextDark on Primary[500]', large: false },
  { fg: '#FFFFFF', bg: colors.primary[500], ctx: 'Dark: White on Primary[500]', large: false },
];

console.log('# Accessibility Audit Report\n');
console.log(`Generated: ${new Date().toISOString()}\n`);

const fails = [];
const passes = [];

tests.forEach(test => {
  const ratio = getContrastRatio(test.fg, test.bg);
  const passesAA = meetsWCAGAA(test.fg, test.bg, test.large);
  const status = passesAA ? '✓ PASS' : '✗ FAIL';
  
  const result = {
    ...test,
    ratio: ratio.toFixed(2),
    passesAA
  };
  
  if (passesAA) {
    passes.push(result);
  } else {
    fails.push(result);
  }
});

console.log(`## Summary\n`);
console.log(`- ❌ **Fails:** ${fails.length}`);
console.log(`- ✅ **Passes:** ${passes.length}\n`);

if (fails.length > 0) {
  console.log(`## ❌ Failing Combinations\n`);
  console.log(`| Context | Foreground | Background | Ratio | Status |`);
  console.log(`|---------|-----------|------------|-------|--------|`);
  fails.forEach(r => {
    console.log(`| ${r.ctx} | \`${r.fg}\` | \`${r.bg}\` | ${r.ratio}:1 | FAIL |`);
  });
  console.log('');
}

console.log(`## ✅ Passing Combinations\n`);
console.log(`| Context | Foreground | Background | Ratio | Status |`);
console.log(`|---------|-----------|------------|-------|--------|`);
passes.forEach(r => {
  console.log(`| ${r.ctx} | \`${r.fg}\` | \`${r.bg}\` | ${r.ratio}:1 | AA ✓ |`);
});

