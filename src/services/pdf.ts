/**
 * Spendly — PDF Report Service
 *
 * Generates beautiful HTML monthly reports rendered to PDF via expo-print.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateMonthlyReportData } from './export';
import { getMonthLabel } from '../utils/formatDate';

/**
 * Generate and share a monthly report PDF.
 */
export async function generateAndShareReport(month: string, currencySymbol: string) {
  const data = generateMonthlyReportData(month);
  const monthLabel = getMonthLabel(month);

  const categoryRows = data.categoryBreakdown
    .slice(0, 8)
    .map(
      (c) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #1F2937;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 12px; height: 12px; border-radius: 6px; background: ${c.color};"></div>
          <span style="color: #E5E7EB;">${c.name}</span>
        </div>
        <span style="color: #F9FAFB; font-weight: 600;">${currencySymbol}${c.amount.toFixed(2)}</span>
      </div>`,
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0A0E1A;
          color: #F9FAFB;
          padding: 40px 32px;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 4px;
        }
        .header p {
          color: #9CA3AF;
          font-size: 14px;
        }
        .summary {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        .summary-card {
          flex: 1;
          background: #111827;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }
        .summary-label {
          color: #9CA3AF;
          font-size: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .summary-value {
          font-size: 24px;
          font-weight: 700;
        }
        .income { color: #10B981; }
        .expense { color: #F43F5E; }
        .savings { color: #6366F1; }
        .section {
          margin-bottom: 32px;
        }
        .section h2 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #F9FAFB;
        }
        .categories {
          background: #111827;
          border-radius: 16px;
          padding: 16px 20px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #1F2937;
        }
        .stat-label { color: #9CA3AF; }
        .stat-value { color: #F9FAFB; font-weight: 600; }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #6B7280;
          font-size: 12px;
        }
        .badge {
          display: inline-block;
          background: ${data.budgetAdherence >= 80 ? '#10B981' : data.budgetAdherence >= 50 ? '#F59E0B' : '#F43F5E'}22;
          color: ${data.budgetAdherence >= 80 ? '#10B981' : data.budgetAdherence >= 50 ? '#F59E0B' : '#F43F5E'};
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Monthly Report</h1>
        <p>${monthLabel}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="summary-label">Income</div>
          <div class="summary-value income">${currencySymbol}${data.totalIncome.toFixed(2)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Expenses</div>
          <div class="summary-value expense">${currencySymbol}${data.totalExpenses.toFixed(2)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Net Savings</div>
          <div class="summary-value savings">${currencySymbol}${data.netSavings.toFixed(2)}</div>
        </div>
      </div>

      <div class="section">
        <h2>Overview</h2>
        <div class="categories">
          <div class="stat-row">
            <span class="stat-label">Total Transactions</span>
            <span class="stat-value">${data.totalTransactions}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Top Category</span>
            <span class="stat-value">${data.topCategory?.name ?? 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Budget Adherence</span>
            <span class="badge">${data.budgetAdherence}%</span>
          </div>
          <div class="stat-row" style="border-bottom: none;">
            <span class="stat-label">Savings Rate</span>
            <span class="stat-value">${data.totalIncome > 0 ? Math.round((data.netSavings / data.totalIncome) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      ${data.categoryBreakdown.length > 0 ? `
      <div class="section">
        <h2>Spending by Category</h2>
        <div class="categories">
          ${categoryRows}
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p>Generated by Spendly • ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Spendly Report - ${monthLabel}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return uri;
}
