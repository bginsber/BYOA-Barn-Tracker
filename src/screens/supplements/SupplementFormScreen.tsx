import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../../theme/colors';
import {
  Horse,
  Supplement,
  SupplementFormData,
  SupplementFrequency,
  StockUnit,
  SupplementsStackParamList,
} from '../../types';
import { supplementService } from '../../services/supplementService';
import { horseService } from '../../services/horseService';

type NavProp = NativeStackNavigationProp<SupplementsStackParamList, 'SupplementForm'>;
type RoutePropType = RouteProp<SupplementsStackParamList, 'SupplementForm'>;

const FREQUENCIES: { value: SupplementFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' },
];

const UNITS: { value: StockUnit; label: string }[] = [
  { value: 'lbs', label: 'lbs' },
  { value: 'oz', label: 'oz' },
  { value: 'kg', label: 'kg' },
  { value: 'bags', label: 'bags' },
  { value: 'scoops', label: 'scoops' },
];

export const SupplementFormScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const existing = route.params?.supplement as Supplement | undefined;
  const preselectedHorse = route.params?.horse as Horse | undefined;

  const [horses, setHorses] = useState<Horse[]>([]);
  const [horsesLoading, setHorsesLoading] = useState(true);

  // Basic fields
  const [name, setName] = useState(existing?.name ?? '');
  const [brand, setBrand] = useState(existing?.brand ?? '');
  const [selectedHorseId, setSelectedHorseId] = useState(
    existing?.horseId ?? preselectedHorse?.id ?? ''
  );
  const [dosage, setDosage] = useState(existing?.dosage ?? '');
  const [frequency, setFrequency] = useState<SupplementFrequency>(
    existing?.frequency ?? 'daily'
  );
  const [currentStock, setCurrentStock] = useState(
    existing?.currentStock?.toString() ?? '0'
  );
  const [stockUnit, setStockUnit] = useState<StockUnit>(existing?.stockUnit ?? 'lbs');
  const [lowStockThreshold, setLowStockThreshold] = useState(
    existing?.lowStockThreshold?.toString() ?? '5'
  );
  const [notes, setNotes] = useState(existing?.notes ?? '');

  // Subscription fields
  const [hasSubscription, setHasSubscription] = useState(
    existing?.subscription?.isActive ?? false
  );
  const [supplier, setSupplier] = useState(existing?.subscription?.supplier ?? '');
  const [deliveryFrequencyDays, setDeliveryFrequencyDays] = useState(
    existing?.subscription?.deliveryFrequencyDays?.toString() ?? '30'
  );
  const [quantityPerDelivery, setQuantityPerDelivery] = useState(
    existing?.subscription?.quantityPerDelivery?.toString() ?? ''
  );
  const [nextDeliveryDate, setNextDeliveryDate] = useState(
    existing?.subscription?.nextDeliveryDate ?? ''
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!existing;

  const loadHorses = useCallback(async () => {
    try {
      const data = await horseService.getHorses();
      setHorses(data);
      if (!selectedHorseId && data.length > 0) {
        setSelectedHorseId(data[0].id);
      }
    } catch {
      // non-fatal
    } finally {
      setHorsesLoading(false);
    }
  }, [selectedHorseId]);

  useEffect(() => {
    loadHorses();
  }, [loadHorses]);

  const selectedHorse = horses.find(h => h.id === selectedHorseId);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a supplement name.');
      return;
    }
    if (!selectedHorseId || !selectedHorse) {
      Alert.alert('Required', 'Please select a horse.');
      return;
    }
    if (!dosage.trim()) {
      Alert.alert('Required', 'Please enter a dosage.');
      return;
    }

    const data: SupplementFormData = {
      name: name.trim(),
      brand: brand.trim() || undefined,
      horseId: selectedHorseId,
      horseName: selectedHorse.name,
      dosage: dosage.trim(),
      frequency,
      currentStock: parseFloat(currentStock) || 0,
      stockUnit,
      lowStockThreshold: parseFloat(lowStockThreshold) || 5,
      notes: notes.trim() || undefined,
      subscription: hasSubscription
        ? {
            isActive: true,
            supplier: supplier.trim() || undefined,
            deliveryFrequencyDays: parseInt(deliveryFrequencyDays, 10) || 30,
            quantityPerDelivery: parseFloat(quantityPerDelivery) || 0,
            nextDeliveryDate: nextDeliveryDate.trim() || undefined,
            lastDeliveryDate: existing?.subscription?.lastDeliveryDate,
          }
        : undefined,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await supplementService.updateSupplement(existing.id, data);
      } else {
        await supplementService.createSupplement(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save supplement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert(
      'Delete Supplement',
      `Delete ${existing.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await supplementService.deleteSupplement(existing.id);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Could not delete supplement.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supplement Details</Text>

          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. SmartPak, Magnesium"
            placeholderTextColor={colors.text.hint}
          />

          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. SmartPak, Purina"
            placeholderTextColor={colors.text.hint}
          />

          <Text style={styles.label}>Horse *</Text>
          {horsesLoading ? (
            <ActivityIndicator color={colors.primary.main} style={{ marginVertical: 8 }} />
          ) : horses.length === 0 ? (
            <View style={styles.noHorsesBox}>
              <Text style={styles.noHorsesText}>
                Add a horse first from the Horses tab
              </Text>
            </View>
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedHorseId}
                onValueChange={(val) => setSelectedHorseId(val)}
                style={styles.picker}
              >
                {horses.map(h => (
                  <Picker.Item key={h.id} label={h.name} value={h.id} />
                ))}
              </Picker>
            </View>
          )}

          <Text style={styles.label}>Dosage *</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g. 2 scoops, 1 packet"
            placeholderTextColor={colors.text.hint}
          />

          <Text style={styles.label}>Frequency *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={frequency}
              onValueChange={(val) => setFrequency(val as SupplementFrequency)}
              style={styles.picker}
            >
              {FREQUENCIES.map(f => (
                <Picker.Item key={f.value} label={f.label} value={f.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory</Text>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Current Stock</Text>
              <TextInput
                style={styles.input}
                value={currentStock}
                onChangeText={setCurrentStock}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.text.hint}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={stockUnit}
                  onValueChange={(val) => setStockUnit(val as StockUnit)}
                  style={styles.picker}
                >
                  {UNITS.map(u => (
                    <Picker.Item key={u.value} label={u.label} value={u.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Low Stock Alert Threshold</Text>
          <TextInput
            style={styles.input}
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
            keyboardType="numeric"
            placeholder="5"
            placeholderTextColor={colors.text.hint}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            placeholder="Any notes..."
            placeholderTextColor={colors.text.hint}
          />
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text style={styles.sectionTitle}>Auto-Delivery / Subscription</Text>
            <Switch
              value={hasSubscription}
              onValueChange={setHasSubscription}
              trackColor={{ true: colors.primary.main }}
              thumbColor={colors.common.white}
            />
          </View>

          {hasSubscription && (
            <>
              <Text style={styles.label}>Supplier</Text>
              <TextInput
                style={styles.input}
                value={supplier}
                onChangeText={setSupplier}
                placeholder="e.g. SmartPak, Valley Vet"
                placeholderTextColor={colors.text.hint}
              />

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Deliver every (days)</Text>
                  <TextInput
                    style={styles.input}
                    value={deliveryFrequencyDays}
                    onChangeText={setDeliveryFrequencyDays}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor={colors.text.hint}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Qty per delivery</Text>
                  <TextInput
                    style={styles.input}
                    value={quantityPerDelivery}
                    onChangeText={setQuantityPerDelivery}
                    keyboardType="numeric"
                    placeholder="e.g. 10"
                    placeholderTextColor={colors.text.hint}
                  />
                </View>
              </View>

              <Text style={styles.label}>Next Delivery Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={nextDeliveryDate}
                onChangeText={setNextDeliveryDate}
                placeholder="e.g. 2026-03-15"
                placeholderTextColor={colors.text.hint}
              />
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.primary.contrast} />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? 'Save Changes' : 'Add Supplement'}
            </Text>
          )}
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && styles.btnDisabled]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color={colors.error.main} />
            ) : (
              <Text style={styles.deleteBtnText}>Delete Supplement</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
    gap: 16,
  },
  section: {
    backgroundColor: colors.common.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.background.paper,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    color: colors.text.primary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 4,
  },
  noHorsesBox: {
    backgroundColor: colors.warning.light + '20',
    padding: 12,
    borderRadius: 8,
  },
  noHorsesText: {
    fontSize: 13,
    color: colors.warning.dark,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: colors.primary.contrast,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: colors.error.main,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: colors.error.main,
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
