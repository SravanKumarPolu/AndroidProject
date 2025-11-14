import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '@/hooks/useSettings';
import { useImpulses } from '@/hooks/useImpulses';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CURRENCY_LIST } from '@/constants/currencies';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { exportData } from '@/utils/export';
import { generatePDFReport } from '@/utils/pdfReport';
import { useStats } from '@/hooks/useStats';
import { isCloudSyncEnabled, setCloudSyncEnabled, getLastSyncTime, syncToCloud } from '@/services/cloudSync';
import { appConfig } from '@/constants/app';
import { storage } from '@/services/storage';
import { cancelAllNotifications } from '@/services/notifications';
import { photos } from '@/services/photos';
import { useToast } from '@/contexts/ToastContext';

export default function SettingsScreen() {
  const { settings, isStrictMode, updateStrictMode, loading } = useSettings();
  const { impulses, loadImpulses } = useImpulses();
  const { stats } = useStats(impulses);
  const { colors, themeMode, setThemeMode } = useTheme();
  const { currency, currencyCode, setCurrency } = useCurrency();
  const { showSuccess, showError } = useToast();
  const [exporting, setExporting] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [cloudSyncEnabled, setCloudSyncEnabledState] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadCloudSyncStatus();
  }, []);

  const loadCloudSyncStatus = async () => {
    const enabled = await isCloudSyncEnabled();
    const syncTime = await getLastSyncTime();
    setCloudSyncEnabledState(enabled);
    setLastSync(syncTime);
  };

  const handleCloudSyncToggle = async (enabled: boolean) => {
    await setCloudSyncEnabled(enabled);
    setCloudSyncEnabledState(enabled);
    if (enabled) {
      // Trigger initial sync
      syncToCloud(impulses).then(success => {
        if (success) {
          loadCloudSyncStatus();
        } else {
          Alert.alert(
            'Sync Failed',
            'Could not sync to cloud. Please check your Supabase configuration in .env file. See SUPABASE_SETUP.md for instructions.',
            [{ text: 'OK' }]
          );
        }
      });
    }
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    if (impulses.length === 0) {
      Alert.alert('No Data', 'You don\'t have any impulses to export yet.');
      return;
    }

    setExporting(true);
    try {
      const exported = await exportData(impulses, format);
      if (exported) {
        Alert.alert(
          'Export Successful',
          `Your data has been exported as ${format.toUpperCase()}!`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Export Failed',
        'There was an error exporting your data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setExporting(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (impulses.length === 0) {
      Alert.alert('No Data', 'You don\'t have any impulses to generate a report yet.');
      return;
    }

    setGeneratingPDF(true);
    try {
      const success = await generatePDFReport({
        impulses,
        stats,
        includeLocation: true,
        includeCategoryBreakdown: true,
      });
      if (success) {
        Alert.alert(
          'Report Generated',
          'Your PDF report has been generated! You can convert it to PDF using your device\'s share options.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Report Generation Failed',
        'There was an error generating your report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your impulses? This action cannot be undone and will delete:\n\n• All impulses\n• All photos\n• All scheduled notifications\n\nYour settings will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);
              
              // Clear all impulses from storage
              await storage.clearAll();
              
              // Cancel all scheduled notifications
              await cancelAllNotifications();
              
              // Delete all photos
              await photos.deleteAllPhotos();
              
              // Reload impulses to update UI
              await loadImpulses();
              
              showSuccess('All data cleared successfully');
            } catch (error) {
              console.error('Error clearing data:', error);
              showError('Failed to clear data. Please try again.');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenPrivacyPolicy = async () => {
    const url = appConfig.privacyPolicyUrl;
    if (url && url !== 'https://yourdomain.com/privacy-policy.html') {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Unable to open privacy policy. Please check your internet connection.',
          [{ text: 'OK' }]
        );
      }
    } else {
      Alert.alert(
        'Privacy Policy',
        'Privacy policy URL not configured. Please update appConfig.privacyPolicyUrl in src/constants/app.ts',
        [{ text: 'OK' }]
      );
    }
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    headerIcon: { backgroundColor: colors.primary[50] },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    iconContainer: { backgroundColor: colors.primary[50] },
    infoTitle: { color: colors.text },
    infoLabel: { color: colors.textLight },
    infoValue: { color: colors.text },
    infoRow: { borderBottomColor: colors.border },
    dangerCard: { borderColor: colors.error[300] },
    dangerTitle: { color: colors.error[700] },
    dangerHint: { color: colors.textLight },
    formatButton: { borderColor: colors.border, backgroundColor: colors.background },
    formatButtonActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
    formatText: { color: colors.textLight },
    formatTextActive: { color: colors.primary[700] },
    syncInfo: { backgroundColor: colors.success[50] },
    syncInfoText: { color: colors.success[700] },
    linkRow: { borderBottomColor: colors.border },
    linkText: { color: colors.text },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, dynamicStyles.headerIcon]}>
            <Ionicons name="settings" size={28} color={colors.primary[600]} />
          </View>
          <Text style={[styles.title, dynamicStyles.title]}>Settings</Text>
          <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Manage your app preferences</Text>
        </View>

        {/* Appearance / Dark Mode */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="moon" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Appearance</Text>
                <Text style={[styles.settingDescription, { color: colors.textLight }]}>
                  {themeMode === 'system' 
                    ? 'Following system preference' 
                    : themeMode === 'dark' 
                    ? 'Dark mode enabled' 
                    : 'Light mode enabled'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.themeOptions}>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  themeMode === mode && styles.themeOptionActive,
                  { borderColor: colors.border },
                  themeMode === mode && { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <Ionicons
                  name={
                    mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'phone-portrait'
                  }
                  size={20}
                  color={themeMode === mode ? colors.primary[600] : colors.textLight}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    { color: colors.textLight },
                    themeMode === mode && { color: colors.primary[700], fontWeight: typography.fontWeight.semibold },
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Currency Selection */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cash" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Currency</Text>
                <Text style={[styles.settingDescription, { color: colors.textLight }]}>
                  Current: {currency.symbol} {currency.name}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.currencyGrid}>
            {CURRENCY_LIST.slice(0, 8).map((curr) => (
              <TouchableOpacity
                key={curr.code}
                style={[
                  styles.currencyOption,
                  currencyCode === curr.code && styles.currencyOptionActive,
                  { borderColor: colors.border },
                  currencyCode === curr.code && { 
                    borderColor: colors.primary[500], 
                    backgroundColor: colors.primary[50] 
                  },
                ]}
                onPress={() => setCurrency(curr.code as any)}
              >
                <Text
                  style={[
                    styles.currencySymbol,
                    { color: colors.textLight },
                    currencyCode === curr.code && { 
                      color: colors.primary[700], 
                      fontWeight: typography.fontWeight.bold 
                    },
                  ]}
                >
                  {curr.symbol}
                </Text>
                <Text
                  style={[
                    styles.currencyCode,
                    { color: colors.textLight },
                    currencyCode === curr.code && { 
                      color: colors.primary[700], 
                      fontWeight: typography.fontWeight.semibold 
                    },
                  ]}
                >
                  {curr.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Strict Mode */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Strict Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.textLight }]}>
                  Requires a reason to skip impulses before cool-down ends. Helps build better habits.
                </Text>
              </View>
            </View>
            <Switch
              value={isStrictMode}
              onValueChange={updateStrictMode}
              trackColor={{ false: colors.gray[300], true: colors.primary[200] }}
              thumbColor={isStrictMode ? colors.primary[600] : colors.gray[400]}
              ios_backgroundColor={colors.gray[300]}
            />
          </View>
          {isStrictMode && (
            <View style={[styles.strictModeHint, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="information-circle" size={16} color={colors.primary[600]} />
              <Text style={[styles.strictModeHintText, { color: colors.primary[800] }]}>
                Strict mode is active. You'll need to provide a reason when skipping impulses.
              </Text>
            </View>
          )}
        </Card>

        {/* Export Data */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>
                <Ionicons name="download-outline" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Export Data</Text>
                <Text style={[styles.settingDescription, { color: colors.textLight }]}>
                  Export all your impulses for backup or analysis
                </Text>
              </View>
            </View>
          </View>
          
          {/* Format Selection */}
          <View style={styles.formatContainer}>
            <TouchableOpacity
              style={[
                styles.formatButton,
                dynamicStyles.formatButton,
                exportFormat === 'csv' && dynamicStyles.formatButtonActive,
              ]}
              onPress={() => setExportFormat('csv')}
              disabled={exporting}
            >
              <Ionicons 
                name={exportFormat === 'csv' ? 'checkbox' : 'square-outline'} 
                size={20} 
                color={exportFormat === 'csv' ? colors.primary[600] : colors.textLight} 
              />
              <Text style={[
                styles.formatText,
                dynamicStyles.formatText,
                exportFormat === 'csv' && dynamicStyles.formatTextActive,
              ]}>
                CSV
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.formatButton,
                dynamicStyles.formatButton,
                exportFormat === 'json' && dynamicStyles.formatButtonActive,
              ]}
              onPress={() => setExportFormat('json')}
              disabled={exporting}
            >
              <Ionicons 
                name={exportFormat === 'json' ? 'checkbox' : 'square-outline'} 
                size={20} 
                color={exportFormat === 'json' ? colors.primary[600] : colors.textLight} 
              />
              <Text style={[
                styles.formatText,
                dynamicStyles.formatText,
                exportFormat === 'json' && dynamicStyles.formatTextActive,
              ]}>
                JSON
              </Text>
            </TouchableOpacity>
          </View>

          {/* Export Button */}
          <Button
            title={exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
            onPress={() => handleExport(exportFormat)}
            variant="primary"
            size="md"
            fullWidth
            loading={exporting}
            disabled={exporting || impulses.length === 0}
            style={styles.exportButton}
          />
          <Button
            title={generatingPDF ? 'Generating...' : 'Generate PDF Report'}
            onPress={handleGeneratePDF}
            variant="outline"
            size="md"
            fullWidth
            loading={generatingPDF}
            disabled={generatingPDF || impulses.length === 0}
            style={styles.exportButton}
          />
        </Card>

        {/* Cloud Sync */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, dynamicStyles.iconContainer]}>
                <Ionicons name="cloud-outline" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Cloud Sync</Text>
                <Text style={[styles.settingDescription, { color: colors.textLight }]}>
                  Backup your data to the cloud (requires setup)
                </Text>
              </View>
            </View>
            <Switch
              value={cloudSyncEnabled}
              onValueChange={handleCloudSyncToggle}
              trackColor={{ false: colors.gray[300], true: colors.primary[200] }}
              thumbColor={cloudSyncEnabled ? colors.primary[600] : colors.gray[400]}
              ios_backgroundColor={colors.gray[300]}
            />
          </View>
          {cloudSyncEnabled && lastSync && (
            <View style={[styles.syncInfo, dynamicStyles.syncInfo]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success[600]} />
              <Text style={[styles.syncInfoText, dynamicStyles.syncInfoText]}>
                Last synced: {new Date(lastSync).toLocaleString()}
              </Text>
            </View>
          )}
        </Card>

        {/* App Info */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, dynamicStyles.infoTitle]}>App Information</Text>
            <View style={[styles.infoRow, dynamicStyles.infoRow]}>
              <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>Version</Text>
              <Text style={[styles.infoValue, dynamicStyles.infoValue]}>{appConfig.version}</Text>
            </View>
            <View style={[styles.infoRow, dynamicStyles.infoRow]}>
              <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>Total Impulses</Text>
              <Text style={[styles.infoValue, dynamicStyles.infoValue]}>{impulses.length}</Text>
            </View>
            {settings?.firstUseDate && (
              <View style={[styles.infoRow, dynamicStyles.infoRow]}>
                <Text style={[styles.infoLabel, dynamicStyles.infoLabel]}>First Use</Text>
                <Text style={[styles.infoValue, dynamicStyles.infoValue]}>
                  {new Date(settings.firstUseDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </Card>

        {/* Legal & Support */}
        <Card variant="elevated" style={styles.card}>
          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, dynamicStyles.infoTitle]}>Legal & Support</Text>
            <TouchableOpacity
              style={[styles.linkRow, dynamicStyles.linkRow]}
              onPress={handleOpenPrivacyPolicy}
              activeOpacity={0.7}
            >
              <View style={styles.linkLeft}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary[600]} />
                <Text style={[styles.linkText, dynamicStyles.linkText]}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Danger Zone */}
        <Card variant="outlined" style={[styles.dangerCard, dynamicStyles.dangerCard]}>
          <View style={styles.dangerSection}>
            <Text style={[styles.dangerTitle, dynamicStyles.dangerTitle]}>Danger Zone</Text>
            <Button
              title="Clear All Data"
              onPress={handleClearData}
              variant="outline"
              size="md"
              style={styles.dangerButton}
            />
            <Text style={[styles.dangerHint, dynamicStyles.dangerHint]}>
              This will permanently delete all your impulses and cannot be undone.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
  },
  card: {
    marginBottom: spacing.base,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.base,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  themeOptionActive: {
    // Handled dynamically
  },
  themeOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  infoSection: {
    paddingVertical: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  dangerCard: {
    marginBottom: spacing.base,
  },
  dangerSection: {
    paddingVertical: spacing.sm,
  },
  dangerTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.base,
  },
  dangerButton: {
    marginBottom: spacing.sm,
  } as const,
  dangerHint: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  strictModeHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: spacing.md,
    gap: spacing.xs,
  },
  strictModeHintText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  formatContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
    marginBottom: spacing.base,
  },
  formatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  formatButtonActive: {
    // Handled dynamically
  },
  formatText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  formatTextActive: {
    fontWeight: typography.fontWeight.semibold,
  },
  exportButton: {
    marginTop: spacing.sm,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: spacing.md,
    gap: spacing.xs,
  },
  syncInfoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  linkText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  currencyOption: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.md,
    borderWidth: 1,
    gap: spacing.xs / 2,
  },
  currencyOptionActive: {
    // Handled dynamically
  },
  currencySymbol: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
  },
  currencyCode: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  currencyHint: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

