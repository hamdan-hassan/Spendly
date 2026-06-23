/**
 * Spendly — Export Service
 *
 * Handles generating and sharing JSON backups and PDF reports.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';

import { useTransactionStore } from '@/store/useTransactionStore';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useSavingsStore } from '@/store/useSavingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAccountStore } from '@/store/useAccountStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { getCategoryById } from '@/constants/categories';
import { formatCurrency } from '@/utils/formatCurrency';
import { getCurrentMonth } from '@/utils/formatDate';

/**
 * Export all app data as a JSON file and open the native share sheet.
 */
export async function exportDataAsJSON() {
  try {
    const transactions = useTransactionStore.getState().transactions;
    const budgets = useBudgetStore.getState().budgets;
    const goals = useSavingsStore.getState().goals;
    const settings = useSettingsStore.getState();
    const accounts = useAccountStore.getState().accounts;
    const gamification = {
      xp: useGamificationStore.getState().xp,
      level: useGamificationStore.getState().level,
      streaks: useGamificationStore.getState().streaks,
      achievements: useGamificationStore.getState().achievements,
      purchasedThemes: useGamificationStore.getState().purchasedThemes,
    };

    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        transactions,
        budgets,
        goals,
        settings,
        accounts,
        gamification,
      },
    };

    const fileName = `spendly_backup_${new Date().getTime()}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Spendly Data',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('Sharing Unavailable', 'Sharing is not supported on this device.');
    }
  } catch (error) {
    console.error('Error exporting JSON:', error);
    Alert.alert('Export Failed', 'There was an error generating your backup.');
  }
}

/**
 * Import app data from a JSON backup file.
 */
export async function importDataFromJSON(): Promise<boolean> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return false;

    const fileAsset = result.assets[0];
    if (!fileAsset.name.endsWith('.json')) {
      Alert.alert('Invalid File', 'Please select a valid JSON backup file.');
      return false;
    }

    const fileContent = await FileSystem.readAsStringAsync(fileAsset.uri);
    const parsedData = JSON.parse(fileContent);

    if (!parsedData.version || !parsedData.data) {
      Alert.alert('Invalid File Format', 'The selected file does not appear to be a Spendly backup.');
      return false;
    }

    const { transactions, budgets, goals, settings, accounts, gamification } = parsedData.data;

    // We ask for confirmation before overwriting
    return new Promise((resolve) => {
      Alert.alert(
        'Restore Backup',
        'This will overwrite your current app data with the backup data. Are you sure you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: () => {
              if (transactions) useTransactionStore.setState({ transactions });
              if (budgets) useBudgetStore.setState({ budgets });
              if (goals) useSavingsStore.setState({ goals });
              if (accounts) useAccountStore.setState({ accounts });
              
              if (settings) {
                const currentSettings = useSettingsStore.getState();
                useSettingsStore.setState({ ...currentSettings, ...settings });
              }

              if (gamification) {
                useGamificationStore.setState({
                  xp: gamification.xp || 0,
                  level: gamification.level || 1,
                  streaks: gamification.streaks || { current: 0, highest: 0, lastLoginDate: '' },
                  achievements: gamification.achievements || [],
                  purchasedThemes: gamification.purchasedThemes || [],
                });
              }

              Alert.alert('Success', 'Data restored successfully! Please restart the app for all changes to take effect fully.');
              resolve(true);
            },
          },
        ]
      );
    });

  } catch (error) {
    console.error('Error importing JSON:', error);
    Alert.alert('Import Failed', 'Could not read the backup file. Make sure it is a valid Spendly backup.');
    return false;
  }
}

/**
 * Generate a beautiful PDF report with charts and open the share sheet.
 */
export async function exportDataAsPDF() {
  try {
    const currentMonth = getCurrentMonth();
    const accountStore = useAccountStore.getState();
    const activeAccountId = accountStore.activeAccountId;
    const activeAccount = accountStore.accounts.find(a => a.id === activeAccountId);
    
    const transactions = useTransactionStore.getState().transactions.filter(t => t.accountId === activeAccountId);
    const budgets = useBudgetStore.getState().budgets.filter(b => b.accountId === activeAccountId);
    const currencySymbol = activeAccount?.currencySymbol || useSettingsStore.getState().currencySymbol;
    const userName = useSettingsStore.getState().userName || 'User';

    const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netSavings = income - expenses;

    // Aggregate category expenses
    const categoryTotals: Record<string, number> = {};
    const categoryColors: Record<string, string> = {};
    const categoryNames: Record<string, string> = {};

    monthTransactions.forEach(t => {
      if (t.type === 'expense') {
        const cat = getCategoryById(t.categoryId);
        const name = cat?.name || 'Other';
        const color = cat?.color || '#9CA3AF';
        
        categoryTotals[name] = (categoryTotals[name] || 0) + t.amount;
        categoryColors[name] = color;
        categoryNames[name] = name;
      }
    });

    const chartLabels = Object.values(categoryNames);
    const chartData = Object.keys(categoryNames).map(k => categoryTotals[k]);
    const chartColors = Object.keys(categoryNames).map(k => categoryColors[k]);

    // Format transaction table
    const transactionRows = monthTransactions.map(t => {
      const cat = getCategoryById(t.categoryId);
      const isExpense = t.type === 'expense';
      const color = isExpense ? '#EF4444' : '#10B981';
      const sign = isExpense ? '-' : '+';
      return `
        <tr>
          <td>${t.date.split('T')[0]}</td>
          <td>${cat?.name || 'Other'}</td>
          <td>${t.note || '-'}</td>
          <td style="color: ${color}; font-weight: bold; text-align: right;">${sign}${currencySymbol}${t.amount.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1F2937; }
            .header { text-align: center; margin-bottom: 40px; }
            .title { font-size: 32px; font-weight: 800; color: #4F46E5; margin: 0; }
            .subtitle { font-size: 18px; color: #6B7280; margin-top: 8px; }
            
            .summary-cards { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .card { flex: 1; background: #F3F4F6; padding: 20px; border-radius: 12px; margin: 0 10px; text-align: center; }
            .card:first-child { margin-left: 0; }
            .card:last-child { margin-right: 0; }
            .card-title { font-size: 14px; color: #6B7280; text-transform: uppercase; font-weight: 600; }
            .card-value { font-size: 24px; font-weight: bold; margin-top: 8px; color: #111827; }
            .income { color: #10B981; }
            .expense { color: #EF4444; }

            .section-title { font-size: 20px; font-weight: bold; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 20px; margin-top: 40px;}
            
            .chart-container { position: relative; height: 300px; width: 100%; margin-bottom: 40px; display: flex; justify-content: center; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background-color: #F9FAFB; padding: 12px; font-size: 14px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Spendly Financial Report</h1>
            <p class="subtitle">Prepared for ${userName} • ${currentMonth}</p>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-title">Total Income</div>
              <div class="card-value income">+${currencySymbol}${income.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Expenses</div>
              <div class="card-value expense">-${currencySymbol}${expenses.toFixed(2)}</div>
            </div>
            <div class="card">
              <div class="card-title">Net Savings</div>
              <div class="card-value">${currencySymbol}${netSavings.toFixed(2)}</div>
            </div>
          </div>

          <h2 class="section-title">Expenses Breakdown</h2>
          <div class="chart-container">
            <canvas id="expenseChart"></canvas>
          </div>

          <h2 class="section-title">Transaction History</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Note</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${transactionRows}
            </tbody>
          </table>

          <script>
            const ctx = document.getElementById('expenseChart').getContext('2d');
            new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: ${JSON.stringify(chartLabels)},
                datasets: [{
                  data: ${JSON.stringify(chartData)},
                  backgroundColor: ${JSON.stringify(chartColors)},
                  borderWidth: 0
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                  legend: { position: 'right' }
                }
              }
            });
          </script>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    Alert.alert(
      'Report Generated',
      'Would you like to download this PDF or share it with others?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Download',
          onPress: async () => {
            if (Platform.OS === 'android') {
              try {
                const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (permissions.granted) {
                  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                  const newUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, `Spendly_Report_${currentMonth}.pdf`, 'application/pdf');
                  await FileSystem.writeAsStringAsync(newUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                  Alert.alert('Success', 'PDF saved to your device.');
                }
              } catch (e) {
                console.log('Download Error:', e);
                Alert.alert('Error', 'Failed to save PDF.');
              }
            } else {
              // On iOS, Sharing natively provides a "Save to Files" option
              const isAvailable = await Sharing.isAvailableAsync();
              if (isAvailable) {
                await Sharing.shareAsync(uri, {
                  mimeType: 'application/pdf',
                  dialogTitle: 'Save PDF Report',
                  UTI: 'com.adobe.pdf',
                });
              }
            }
          },
        },
        {
          text: 'Share',
          onPress: async () => {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
              await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Share PDF Report',
                UTI: 'com.adobe.pdf',
              });
            } else {
              Alert.alert('Sharing Unavailable', 'Sharing is not supported on this device.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Export Failed', 'There was an error generating your PDF report.');
  }
}
