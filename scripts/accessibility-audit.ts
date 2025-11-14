/**
 * Comprehensive Accessibility Audit Script
 * Analyzes all color combinations in the ImpulseVault app
 */

import { generateAccessibilityReport, type ColorPair } from '../src/utils/contrastChecker';
import { colors, darkColors } from '../src/constants/colors';

// Define all color combinations to audit
function getAllColorPairs(): ColorPair[] {
  const pairs: ColorPair[] = [];
  
  // Light theme combinations
  pairs.push(
    // Text on backgrounds
    {
      foreground: colors.text,
      background: colors.background,
      context: 'Light: Text on background',
      isLargeText: false,
    },
    {
      foreground: colors.text,
      background: colors.surface,
      context: 'Light: Text on surface',
      isLargeText: false,
    },
    {
      foreground: colors.textLight,
      background: colors.background,
      context: 'Light: TextLight on background',
      isLargeText: false,
    },
    {
      foreground: colors.textLight,
      background: colors.surface,
      context: 'Light: TextLight on surface',
      isLargeText: false,
    },
    {
      foreground: colors.textSecondary,
      background: colors.background,
      context: 'Light: TextSecondary on background',
      isLargeText: false,
    },
    {
      foreground: colors.textSecondary,
      background: colors.surface,
      context: 'Light: TextSecondary on surface',
      isLargeText: false,
    },
    {
      foreground: colors.textDark,
      background: colors.background,
      context: 'Light: TextDark on background',
      isLargeText: false,
    },
    {
      foreground: colors.textDark,
      background: colors.surface,
      context: 'Light: TextDark on surface',
      isLargeText: false,
    },
    
    // Primary colors on backgrounds
    {
      foreground: colors.primary[500],
      background: colors.surface,
      context: 'Light: Primary[500] on surface',
      isLargeText: false,
    },
    {
      foreground: colors.primary[500],
      background: colors.background,
      context: 'Light: Primary[500] on background',
      isLargeText: false,
    },
    {
      foreground: colors.primary[600],
      background: colors.surface,
      context: 'Light: Primary[600] on surface',
      isLargeText: false,
    },
    {
      foreground: colors.primary[600],
      background: colors.background,
      context: 'Light: Primary[600] on background',
      isLargeText: false,
    },
    {
      foreground: colors.primary[700],
      background: colors.surface,
      context: 'Light: Primary[700] on surface',
      isLargeText: false,
    },
    
    // Text on primary
    {
      foreground: colors.textDark,
      background: colors.primary[500],
      context: 'Light: TextDark on Primary[500] (buttons)',
      isLargeText: false,
    },
    {
      foreground: colors.text,
      background: colors.primary[50],
      context: 'Light: Text on Primary[50] (light backgrounds)',
      isLargeText: false,
    },
    {
      foreground: colors.primary[700],
      background: colors.primary[50],
      context: 'Light: Primary[700] on Primary[50]',
      isLargeText: false,
    },
    
    // Success colors
    {
      foreground: colors.success[600],
      background: colors.surface,
      context: 'Light: Success[600] on surface',
      isLargeText: false,
    },
    {
      foreground: colors.success[600],
      background: colors.background,
      context: 'Light: Success[600] on background',
      isLargeText: false,
    },
    {
      foreground: colors.success[700],
      background: colors.success[50],
      context: 'Light: Success[700] on Success[50]',
      isLargeText: false,
    },
    
    // Error colors
    {
      foreground: colors.error[600],
      background: colors.surface,
      context: 'Light: Error[600] on surface',
      isLargeText: false,
    },
    {
      foreground: colors.error[600],
      background: colors.background,
      context: 'Light: Error[600] on background',
      isLargeText: false,
    },
    {
      foreground: colors.error[700],
      background: colors.error[50],
      context: 'Light: Error[700] on Error[50]',
      isLargeText: false,
    },
    
    // Accent colors
    {
      foreground: colors.accent[500],
      background: colors.surface,
      context: 'Light: Accent[500] on surface',
      isLargeText: false,
    },
    {
      foreground: colors.accent[600],
      background: colors.surface,
      context: 'Light: Accent[600] on surface',
      isLargeText: false,
    },
    
    // Borders
    {
      foreground: colors.border,
      background: colors.surface,
      context: 'Light: Border on surface (visibility)',
      isLargeText: false,
    },
    {
      foreground: colors.border,
      background: colors.background,
      context: 'Light: Border on background (visibility)',
      isLargeText: false,
    },
    
    // Gray scale
    {
      foreground: colors.gray[400],
      background: colors.surface,
      context: 'Light: Gray[400] on surface',
      isLargeText: false,
    },
    {
      foreground: colors.gray[500],
      background: colors.surface,
      context: 'Light: Gray[500] on surface',
      isLargeText: false,
    },
    {
      foreground: colors.gray[600],
      background: colors.surface,
      context: 'Light: Gray[600] on surface',
      isLargeText: false,
    },
    
    // Secondary button
    {
      foreground: colors.text,
      background: colors.gray[100],
      context: 'Light: Text on Gray[100] (secondary button)',
      isLargeText: false,
    },
  );
  
  // Dark theme combinations
  pairs.push(
    // Text on backgrounds
    {
      foreground: darkColors.text,
      background: darkColors.background,
      context: 'Dark: Text on background',
      isLargeText: false,
    },
    {
      foreground: darkColors.text,
      background: darkColors.surface,
      context: 'Dark: Text on surface',
      isLargeText: false,
    },
    {
      foreground: darkColors.textLight,
      background: darkColors.background,
      context: 'Dark: TextLight on background',
      isLargeText: false,
    },
    {
      foreground: darkColors.textLight,
      background: darkColors.surface,
      context: 'Dark: TextLight on surface',
      isLargeText: false,
    },
    {
      foreground: darkColors.textSecondary,
      background: darkColors.background,
      context: 'Dark: TextSecondary on background',
      isLargeText: false,
    },
    {
      foreground: darkColors.textSecondary,
      background: darkColors.surface,
      context: 'Dark: TextSecondary on surface',
      isLargeText: false,
    },
    {
      foreground: darkColors.textDark,
      background: darkColors.background,
      context: 'Dark: TextDark on background',
      isLargeText: false,
    },
    {
      foreground: darkColors.textDark,
      background: darkColors.surface,
      context: 'Dark: TextDark on surface',
      isLargeText: false,
    },
    
    // Primary colors on backgrounds
    {
      foreground: darkColors.primary[500],
      background: darkColors.surface,
      context: 'Dark: Primary[500] on surface',
      isLargeText: false,
    },
    {
      foreground: darkColors.primary[500],
      background: darkColors.background,
      context: 'Dark: Primary[500] on background',
      isLargeText: false,
    },
    {
      foreground: darkColors.primary[600],
      background: darkColors.surface,
      context: 'Dark: Primary[600] on surface',
      isLargeText: false,
    },
    {
      foreground: darkColors.primary[600],
      background: darkColors.background,
      context: 'Dark: Primary[600] on background',
      isLargeText: false,
    },
    
    // Text on primary (buttons in dark mode)
    {
      foreground: darkColors.textDark,
      background: darkColors.primary[500],
      context: 'Dark: TextDark on Primary[500] (buttons)',
      isLargeText: false,
    },
    {
      foreground: darkColors.text,
      background: darkColors.primary[50],
      context: 'Dark: Text on Primary[50]',
      isLargeText: false,
    },
    {
      foreground: darkColors.primary[700],
      background: darkColors.primary[50],
      context: 'Dark: Primary[700] on Primary[50]',
      isLargeText: false,
    },
    
    // Success colors
    {
      foreground: darkColors.success[600],
      background: darkColors.surface,
      context: 'Dark: Success[600] on surface',
      isLargeText: false,
    },
    {
      foreground: darkColors.success[600],
      background: darkColors.background,
      context: 'Dark: Success[600] on background',
      isLargeText: false,
    },
    {
      foreground: darkColors.success[700],
      background: darkColors.success[50],
      context: 'Dark: Success[700] on Success[50]',
      isLargeText: false,
    },
    
    // Error colors
    {
      foreground: darkColors.error[600],
      background: darkColors.surface,
      context: 'Dark: Error[600] on surface',
      isLargeText: false,
    },
    {
      foreground: darkColors.error[600],
      background: darkColors.background,
      context: 'Dark: Error[600] on background',
      isLargeText: false,
    },
    {
      foreground: darkColors.error[700],
      background: darkColors.error[50],
      context: 'Dark: Error[700] on Error[50]',
      isLargeText: false,
    },
    
    // Borders
    {
      foreground: darkColors.border,
      background: darkColors.surface,
      context: 'Dark: Border on surface (visibility)',
      isLargeText: false,
    },
    {
      foreground: darkColors.border,
      background: darkColors.background,
      context: 'Dark: Border on background (visibility)',
      isLargeText: false,
    },
    
    // Secondary button
    {
      foreground: darkColors.text,
      background: darkColors.gray[100],
      context: 'Dark: Text on Gray[100] (secondary button)',
      isLargeText: false,
    },
    
    // Status colors
    {
      foreground: '#FFFFFF',
      background: darkColors.primary[500],
      context: 'Dark: White text on Primary[500] (status badges)',
      isLargeText: false,
    },
  );
  
  return pairs;
}

// Run the audit
const pairs = getAllColorPairs();
const report = generateAccessibilityReport(pairs);

// Format report as markdown
function formatReport(report: typeof generateAccessibilityReport extends (...args: any[]) => infer R ? R : never): string {
  const fails = report.filter(r => r.level === 'fail');
  const aaPass = report.filter(r => r.level === 'aa');
  const aaaPass = report.filter(r => r.level === 'aaa');
  
  let output = '# Accessibility Audit Report\n\n';
  output += `**Generated:** ${new Date().toISOString()}\n\n`;
  output += `## Summary\n\n`;
  output += `- ❌ **Fails (${fails.length}):** Color combinations that don't meet WCAG 2.2 AA\n`;
  output += `- ⚠️  **AA Pass (${aaPass.length}):** Meets WCAG 2.2 AA but not AAA\n`;
  output += `- ✅ **AAA Pass (${aaaPass.length}):** Meets WCAG 2.2 AAA\n`;
  output += `- **Total:** ${report.length} color combinations tested\n\n`;
  
  if (fails.length > 0) {
    output += `## ❌ Failing Combinations\n\n`;
    output += `| Context | Foreground | Background | Ratio | Status | Suggested Fix |\n`;
    output += `|---------|-----------|------------|-------|--------|---------------|\n`;
    
    fails.forEach(r => {
      const fg = r.pair.foreground;
      const bg = r.pair.background;
      const ratio = r.ratio.toFixed(2);
      const suggestion = r.suggestedForeground 
        ? `Use foreground: ${r.suggestedForeground}`
        : r.suggestedBackground
        ? `Use background: ${r.suggestedBackground}`
        : 'Manual adjustment needed';
      
      output += `| ${r.pair.context} | \`${fg}\` | \`${bg}\` | ${ratio}:1 | FAIL | ${suggestion} |\n`;
    });
    
    output += '\n';
  }
  
  // Show AA pass items (for reference)
  if (aaPass.length > 0) {
    output += `## ⚠️ AA Pass (Consider AAA)\n\n`;
    output += `| Context | Foreground | Background | Ratio | Status |\n`;
    output += `|---------|-----------|------------|-------|--------|\n`;
    
    aaPass.forEach(r => {
      const fg = r.pair.foreground;
      const bg = r.pair.background;
      const ratio = r.ratio.toFixed(2);
      
      output += `| ${r.pair.context} | \`${fg}\` | \`${bg}\` | ${ratio}:1 | AA ✓ |\n`;
    });
    
    output += '\n';
  }
  
  // Show AAA pass items
  if (aaaPass.length > 0) {
    output += `## ✅ AAA Pass\n\n`;
    output += `| Context | Foreground | Background | Ratio | Status |\n`;
    output += `|---------|-----------|------------|-------|--------|\n`;
    
    aaaPass.forEach(r => {
      const fg = r.pair.foreground;
      const bg = r.pair.background;
      const ratio = r.ratio.toFixed(2);
      
      output += `| ${r.pair.context} | \`${fg}\` | \`${bg}\` | ${ratio}:1 | AAA ✓ |\n`;
    });
    
    output += '\n';
  }
  
  return output;
}

// Export for use in audit script
export { getAllColorPairs, formatReport };

// If running directly, output the report
if (require.main === module) {
  console.log(formatReport(report));
}

