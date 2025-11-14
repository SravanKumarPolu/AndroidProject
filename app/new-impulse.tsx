import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useImpulses } from '@/hooks/useImpulses';
import { usePatterns } from '@/hooks/usePatterns';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { CATEGORIES, CATEGORY_LABELS, EMOTION_LABELS, URGENCY_LABELS } from '@/constants/categories';
import { CategoryIcon } from '@/components/CategoryIcon';
import { COOL_DOWN_PERIODS, COOL_DOWN_LABELS, COOL_DOWN_DESCRIPTIONS, getDefaultCoolDownSync } from '@/constants/coolDown';
import { settings } from '@/services/settings';
import { ImpulseCategory, EmotionTag, UrgencyLevel, CoolDownPeriod } from '@/types/impulse';
import { safeValidateCreateImpulse, getValidationErrors } from '@/utils/validation';
import { ImagePickerButton } from '@/components/ImagePickerButton';
import { photos } from '@/services/photos';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentLocation, hasLocationPermissions, formatLocation } from '@/services/location';

export default function NewImpulseScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { impulses, createImpulse } = useImpulses();
  const { matchCurrentImpulse } = usePatterns(impulses);
  const { showError, showSuccess } = useToast();
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ImpulseCategory | null>(null);
  const [emotion, setEmotion] = useState<EmotionTag | null>(null);
  const [urgency, setUrgency] = useState<UrgencyLevel>('IMPULSE');
  const [coolDownPeriod, setCoolDownPeriod] = useState<CoolDownPeriod>(() => 
    getDefaultCoolDownSync('IMPULSE')
  );

  // Load user's preferred default cooldown on mount
  React.useEffect(() => {
    const loadUserDefault = async () => {
      try {
        const userDefault = await settings.getDefaultCoolDown();
        setCoolDownPeriod(userDefault);
      } catch (error) {
        // Use sync fallback
        setCoolDownPeriod(getDefaultCoolDownSync(urgency));
      }
    };
    loadUserDefault();
  }, []);
  const [loading, setLoading] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | undefined>();
  const [tempPhotoUri, setTempPhotoUri] = useState<string | undefined>();
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Auto-update cool-down when urgency changes
  useEffect(() => {
    const updateCoolDown = async () => {
      try {
        const userDefault = await settings.getDefaultCoolDown();
        // For essentials, use shorter period if user default is longer
        if (urgency === 'ESSENTIAL' && ['1H', '6H', '24H', '3D'].includes(userDefault)) {
          setCoolDownPeriod('30M');
        } else {
          setCoolDownPeriod(userDefault);
        }
      } catch {
        setCoolDownPeriod(getDefaultCoolDownSync(urgency));
      }
    };
    updateCoolDown();
  }, [urgency]);

  // Check location permissions on mount
  useEffect(() => {
    checkLocationPermissions();
  }, []);

  const checkLocationPermissions = async () => {
    const hasPermission = await hasLocationPermissions();
    setLocationEnabled(hasPermission);
    if (hasPermission) {
      // Optionally get location on mount
      // const location = await getCurrentLocation();
      // if (location) setCurrentLocation(location);
    }
  };

  const handleToggleLocation = async () => {
    if (!locationEnabled) {
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        setLocationEnabled(true);
      }
    } else {
      setCurrentLocation(null);
      setLocationEnabled(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category) {
      showError('Please fill in all required fields');
      return;
    }

    // Validate input data
    const priceValue = price ? parseFloat(price.replace(/[₹,\s]/g, '')) : undefined;
    const formData = {
      title: title.trim(),
      category,
      price: priceValue && !isNaN(priceValue) ? priceValue : undefined,
      emotion: emotion || undefined,
      urgency,
      coolDownPeriod,
    };

    const validation = safeValidateCreateImpulse(formData);
    if (!validation.success) {
      const errors = validation.errors;
      if (errors) {
        const errorMessages = Object.values(errors)
          .flatMap(field => {
            if (typeof field === 'object' && field !== null && '_errors' in field) {
              return field._errors || [];
            }
            return [];
          })
          .filter(Boolean);
        showError(errorMessages[0] || 'Please check your input');
      } else {
        showError('Invalid input. Please check your data.');
      }
      return;
    }

    setLoading(true);
    try {
      // Generate impulse ID first
      const impulseId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Save photo if one was selected
      let finalPhotoUri: string | undefined;
      if (tempPhotoUri) {
        try {
          finalPhotoUri = await photos.savePhotoForImpulse(impulseId, tempPhotoUri);
        } catch (photoError) {
          console.error('Error saving photo:', photoError);
          // Continue without photo - don't fail the whole operation
        }
      }
      
      // Create impulse with photo URI and location
      const newImpulse = await createImpulse({
        ...validation.data!,
        price: validation.data!.price ?? undefined,
        emotion: validation.data!.emotion ?? undefined,
        photoUri: finalPhotoUri,
        location: currentLocation || undefined,
      });
      
      showSuccess('Impulse locked! Starting cooldown...');
      // Navigate to cooldown screen
      router.push(`/cooldown/${newImpulse.id}`);
    } catch (error) {
      console.error('Error creating impulse:', error);
      showError('Failed to create impulse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelected = (uri: string) => {
    setTempPhotoUri(uri);
  };

  const handlePhotoRemoved = () => {
    setTempPhotoUri(undefined);
  };

  const canSubmit = title.trim().length > 0 && category !== null;

  // Check for pattern matches
  const patternMatches = React.useMemo(() => {
    if (!title.trim() || !category) return [];
    
    const priceValue = price ? parseFloat(price.replace(/[₹,\s]/g, '')) : undefined;
    const tempImpulse: any = {
      id: 'temp',
      title: title.trim(),
      category,
      price: priceValue && !isNaN(priceValue) ? priceValue : undefined,
      createdAt: Date.now(),
      status: 'LOCKED',
    };
    
    return matchCurrentImpulse(tempImpulse);
  }, [title, category, price, matchCurrentImpulse]);

  const strongMatch = patternMatches.find(m => m.matchScore >= 60);

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textLight },
    sectionLabel: { color: colors.text },
    hint: { color: colors.textLight },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, dynamicStyles.title]}>New Impulse</Text>
            <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Lock it before you buy it</Text>
          </View>

          {/* Title Input */}
          <Input
            label="What do you want to buy/do?"
            placeholder="e.g., Swiggy burger, New headset, Nifty options"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          {/* Price Input */}
          <Input
            label="Price (optional)"
            placeholder="₹0"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>Category</Text>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                >
                  <CategoryIcon
                    category={cat}
                    size={20}
                    color={category === cat ? colors.textDark : colors.primary[600]}
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Urgency Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>Urgency</Text>
            <View style={styles.row}>
              {(['ESSENTIAL', 'NICE_TO_HAVE', 'IMPULSE'] as UrgencyLevel[]).map((urg) => (
                <Button
                  key={urg}
                  title={URGENCY_LABELS[urg]}
                  onPress={() => setUrgency(urg)}
                  variant={urgency === urg ? 'primary' : 'outline'}
                  size="sm"
                  style={styles.urgencyButton}
                />
              ))}
            </View>
          </View>

          {/* Cool-Down Period Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>Cool-Down Period</Text>
            <View style={styles.grid}>
              {COOL_DOWN_PERIODS.map((period) => (
                <View key={period} style={styles.coolDownOption}>
                  <Button
                    title={COOL_DOWN_LABELS[period]}
                    onPress={() => setCoolDownPeriod(period)}
                    variant={coolDownPeriod === period ? 'primary' : 'outline'}
                    size="sm"
                    style={styles.coolDownButton}
                  />
                  <Text style={styles.coolDownHint}>
                    {COOL_DOWN_DESCRIPTIONS[period]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Emotion Selection (Optional) */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, dynamicStyles.sectionLabel]}>How are you feeling? (optional)</Text>
            <View style={styles.row}>
              {(['BORED', 'STRESSED', 'FOMO', 'HAPPY', 'LONELY', 'NONE'] as EmotionTag[]).map((emo) => (
                <Button
                  key={emo}
                  title={EMOTION_LABELS[emo]}
                  onPress={() => setEmotion(emo === emotion ? null : emo)}
                  variant={emotion === emo ? 'primary' : 'ghost'}
                  size="sm"
                  style={styles.emotionButton}
                />
              ))}
            </View>
          </View>

          {/* Photo Attachment */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Photo (optional)</Text>
            <ImagePickerButton
              onImageSelected={handlePhotoSelected}
              onImageRemoved={handlePhotoRemoved}
              currentImageUri={tempPhotoUri}
              disabled={loading}
            />
          </View>

          {/* Location Tracking */}
          <View style={styles.section}>
            <View style={styles.locationHeader}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Location (optional)</Text>
              <TouchableOpacity
                onPress={handleToggleLocation}
                style={[
                  styles.locationToggle,
                  locationEnabled && { backgroundColor: colors.primary[50] },
                ]}
                disabled={loading}
              >
                <Ionicons
                  name={locationEnabled ? 'location' : 'location-outline'}
                  size={20}
                  color={locationEnabled ? colors.primary[600] : colors.textLight}
                />
                <Text
                  style={[
                    styles.locationToggleText,
                    { color: locationEnabled ? colors.primary[600] : colors.textLight },
                  ]}
                >
                  {locationEnabled ? 'Enabled' : 'Enable'}
                </Text>
              </TouchableOpacity>
            </View>
            {currentLocation && (
              <View style={[styles.locationDisplay, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="pin" size={16} color={colors.primary[600]} />
                <Text style={[styles.locationText, { color: colors.primary[700] }]}>
                  {formatLocation(currentLocation)}
                </Text>
              </View>
            )}
            <Text style={[styles.hint, { color: colors.textLight }]}>
              Track where you make impulse purchases for better insights
            </Text>
          </View>

          {/* Pattern Warning */}
          {strongMatch && (
            <Card
              variant="elevated"
              style={[
                styles.patternWarning,
                {
                  backgroundColor: colors.warning[50],
                  borderColor: colors.warning[200],
                },
              ]}
            >
              <View style={styles.patternWarningHeader}>
                <Ionicons name="warning" size={20} color={colors.warning[600]} />
                <Text style={[styles.patternWarningTitle, { color: colors.warning[700] }]}>
                  Recurring Pattern Detected
                </Text>
              </View>
              <Text style={[styles.patternWarningText, { color: colors.warning[600] }]}>
                This looks similar to a recurring pattern you've logged before. This is the{' '}
                {strongMatch.pattern.totalOccurrences + 1} time you're considering this.
              </Text>
              {strongMatch.pattern.regretRate > 40 && (
                <Text style={[styles.patternWarningText, { color: colors.warning[600], marginTop: spacing.xs }]}>
                  ⚠️ You've regretted {Math.round(strongMatch.pattern.regretRate)}% of similar purchases.
                </Text>
              )}
            </Card>
          )}

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <Button
              title="Lock This Impulse"
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
              loading={loading}
              fullWidth
              size="lg"
            />
            <Text style={[styles.hint, dynamicStyles.hint]}>
              This will lock for {COOL_DOWN_LABELS[coolDownPeriod].toLowerCase()}. You'll be prompted to review it then.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  urgencyButton: {
    flex: 1,
    minWidth: '30%',
  },
  emotionButton: {
    flex: 1,
    minWidth: '30%',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: 'transparent',
    gap: spacing.xs,
    minWidth: '30%',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  categoryButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[600],
  },
  categoryButtonTextActive: {
    color: colors.textDark,
  },
  coolDownOption: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  coolDownButton: {
    marginBottom: spacing.xs,
  },
  coolDownHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  submitContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  patternWarning: {
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  patternWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  patternWarningTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  patternWarningText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.md,
    gap: spacing.xs,
  },
  locationToggleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  locationText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
});

