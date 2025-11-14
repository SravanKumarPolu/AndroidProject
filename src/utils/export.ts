import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Impulse } from '@/types/impulse';
import { formatDateTime } from './date';
import { formatCurrency } from './currency';
import { CATEGORY_LABELS } from '@/constants/categories';

/**
 * Export impulses as CSV
 */
function exportToCSV(impulses: Impulse[]): string {
  const headers = [
    'ID',
    'Title',
    'Category',
    'Price',
    'Emotion',
    'Urgency',
    'Cool-Down Period',
    'Created At',
    'Review At',
    'Status',
    'Executed At',
    'Final Feeling',
    'Skipped Feeling',
    'Notes',
  ];

  const rows = impulses.map(impulse => [
    impulse.id,
    impulse.title,
    CATEGORY_LABELS[impulse.category],
    impulse.price?.toString() || '',
    impulse.emotion || '',
    impulse.urgency,
    impulse.coolDownPeriod || '24H',
    formatDateTime(impulse.createdAt),
    formatDateTime(impulse.reviewAt),
    impulse.status,
    impulse.executedAt ? formatDateTime(impulse.executedAt) : '',
    impulse.finalFeeling || '',
    impulse.skippedFeeling || '',
    impulse.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Export impulses as JSON
 */
function exportToJSON(impulses: Impulse[]): string {
  return JSON.stringify(impulses, null, 2);
}

/**
 * Export data to file and share
 */
export async function exportData(
  impulses: Impulse[],
  format: 'csv' | 'json' = 'csv'
): Promise<boolean> {
  try {
    if (impulses.length === 0) {
      throw new Error('No data to export');
    }

    const content = format === 'csv' ? exportToCSV(impulses) : exportToJSON(impulses);
    const filename = `impulsevault-export-${new Date().toISOString().split('T')[0]}.${format}`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Write file
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: format === 'csv' ? 'text/csv' : 'application/json',
        dialogTitle: 'Export ImpulseVault Data',
      });
      return true;
    } else {
      // Fallback: copy to clipboard or show file path
      const { logger } = await import('./logger');
      logger.info('File saved to:', fileUri);
      return false;
    }
  } catch (error) {
    const { logger } = await import('./logger');
    logger.error('Error exporting data', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Export as CSV (convenience function)
 */
export async function exportAsCSV(impulses: Impulse[]): Promise<boolean> {
  return exportData(impulses, 'csv');
}

/**
 * Export as JSON (convenience function)
 */
export async function exportAsJSON(impulses: Impulse[]): Promise<boolean> {
  return exportData(impulses, 'json');
}

