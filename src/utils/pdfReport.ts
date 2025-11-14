/**
 * PDF Report Generation
 * Creates professional PDF reports from impulse data
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Impulse } from '@/types/impulse';
import { UserStats } from '@/types/impulse';
import { formatDateTime, formatDate } from './date';
import { CATEGORY_LABELS } from '@/constants/categories';
import { getLocationInsights } from './locationInsights';

interface PDFReportOptions {
  impulses: Impulse[];
  stats: UserStats;
  includeCharts?: boolean;
  includeLocation?: boolean;
  includeCategoryBreakdown?: boolean;
}

/**
 * Generate HTML content for PDF
 */
function generateHTMLContent(options: PDFReportOptions): string {
  const { impulses, stats, includeLocation = true, includeCategoryBreakdown = true } = options;
  
  const locationInsights = includeLocation ? getLocationInsights(impulses) : null;
  
  // Category breakdown
  const categoryStats: Record<string, { count: number; spent: number; saved: number }> = {};
  impulses.forEach(impulse => {
    const cat = CATEGORY_LABELS[impulse.category];
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, spent: 0, saved: 0 };
    }
    categoryStats[cat].count++;
    if (impulse.price) {
      if (impulse.status === 'EXECUTED') {
        categoryStats[cat].spent += impulse.price;
      } else if (impulse.status === 'CANCELLED') {
        categoryStats[cat].saved += impulse.price;
      }
    }
  });

  const reportDate = formatDate(Date.now());
  const totalImpulses = impulses.length;
  const executedImpulses = impulses.filter(i => i.status === 'EXECUTED');
  const cancelledImpulses = impulses.filter(i => i.status === 'CANCELLED');
  const regrettedImpulses = executedImpulses.filter(i => i.finalFeeling === 'REGRET');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      padding: 40px;
      background: #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #6366f1;
    }
    .header h1 {
      color: #6366f1;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 24px;
      color: #1f2937;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #6366f1;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .table th,
    .table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .table tr:hover {
      background: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge-executed {
      background: #dbeafe;
      color: #1e40af;
    }
    .badge-cancelled {
      background: #d1fae5;
      color: #065f46;
    }
    .badge-regret {
      background: #fee2e2;
      color: #991b1b;
    }
    .insight-box {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .insight-title {
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ImpulseVault Report</h1>
    <p>Generated on ${reportDate}</p>
  </div>

  <div class="section">
    <h2 class="section-title">Summary Statistics</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">₹${stats.totalSaved.toLocaleString()}</div>
        <div class="stat-label">Total Money Saved</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalCancelled}</div>
        <div class="stat-label">Impulses Avoided</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.currentStreak}</div>
        <div class="stat-label">Current Streak (Days)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Math.round(stats.regretRate)}%</div>
        <div class="stat-label">Regret Rate</div>
      </div>
    </div>
  </div>

  ${includeCategoryBreakdown ? `
  <div class="section">
    <h2 class="section-title">Category Breakdown</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Total Impulses</th>
          <th>Money Spent</th>
          <th>Money Saved</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(categoryStats).map(([cat, data]) => `
          <tr>
            <td>${cat}</td>
            <td>${data.count}</td>
            <td>₹${data.spent.toLocaleString()}</td>
            <td>₹${data.saved.toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${locationInsights && locationInsights.uniqueLocations > 0 ? `
  <div class="section">
    <h2 class="section-title">Location Insights</h2>
    <div class="insight-box">
      <div class="insight-title">Most Frequent Location</div>
      <div>${locationInsights.mostFrequentLocation?.location || 'N/A'} (${locationInsights.mostFrequentLocation?.count || 0} times)</div>
    </div>
    <div class="insight-box">
      <div class="insight-title">Highest Spending Location</div>
      <div>${locationInsights.highestSpendingLocation?.location || 'N/A'} (₹${locationInsights.highestSpendingLocation?.totalSpent.toLocaleString() || 0})</div>
    </div>
    <p style="margin-top: 15px; color: #6b7280;">
      Total unique locations: ${locationInsights.uniqueLocations}
    </p>
  </div>
  ` : ''}

  <div class="section">
    <h2 class="section-title">Recent Impulses</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th>Category</th>
          <th>Price</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${impulses.slice(0, 20).map(impulse => `
          <tr>
            <td>${formatDate(impulse.createdAt)}</td>
            <td>${impulse.title}</td>
            <td>${CATEGORY_LABELS[impulse.category]}</td>
            <td>${impulse.price ? `₹${impulse.price.toLocaleString()}` : '-'}</td>
            <td>
              <span class="badge badge-${impulse.status === 'EXECUTED' ? 'executed' : 'cancelled'}">
                ${impulse.status}
              </span>
              ${impulse.finalFeeling === 'REGRET' ? '<span class="badge badge-regret">Regret</span>' : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>This report was generated by ImpulseVault</p>
    <p>Total impulses analyzed: ${totalImpulses} | Executed: ${executedImpulses.length} | Cancelled: ${cancelledImpulses.length}</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate and share PDF report
 * Note: This creates an HTML file that can be converted to PDF by the system
 */
export async function generatePDFReport(
  options: PDFReportOptions
): Promise<boolean> {
  try {
    const htmlContent = generateHTMLContent(options);
    const filename = `impulsevault-report-${new Date().toISOString().split('T')[0]}.html`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Write HTML file
    await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file (user can convert to PDF using their device)
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/html',
        dialogTitle: 'Share ImpulseVault Report',
        UTI: 'public.html', // iOS
      });
      return true;
    } else {
      console.log('File saved to:', fileUri);
      return false;
    }
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
}



