import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSupplements } from '../../hooks/useSupplements';
import { colors } from '../../theme/colors';
import { Supplement, SupplementsStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<SupplementsStackParamList, 'SupplementsList'>;

const FREQUENCY_LABELS: Record<Supplement['frequency'], string> = {
  daily: 'Daily',
  twice_daily: 'Twice daily',
  weekly: 'Weekly',
  as_needed: 'As needed',
};

const UNIT_LABELS: Record<Supplement['stockUnit'], string> = {
  lbs: 'lbs',
  oz: 'oz',
  kg: 'kg',
  bags: 'bags',
  scoops: 'scoops',
};

function stockColor(supplement: Supplement): string {
  if (supplement.currentStock <= 0) return colors.error.main;
  if (supplement.currentStock <= supplement.lowStockThreshold) return colors.warning.main;
  return colors.success.main;
}

function stockLabel(supplement: Supplement): string {
  if (supplement.currentStock <= 0) return 'Out of stock';
  if (supplement.currentStock <= supplement.lowStockThreshold) return 'Low stock';
  return 'In stock';
}

export const SupplementsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { supplements, loading, error, refresh, recordDelivery, deleteSupplement } =
    useSupplements();

  // Delivery modal state
  const [deliveryTarget, setDeliveryTarget] = useState<Supplement | null>(null);
  const [deliveryQty, setDeliveryQty] = useState('');
  const [recording, setRecording] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Group by horse
  const sections = React.useMemo(() => {
    const map = new Map<string, { horseName: string; data: Supplement[] }>();
    for (const s of supplements) {
      const key = s.horseId;
      if (!map.has(key)) {
        map.set(key, { horseName: s.horseName, data: [] });
      }
      map.get(key)!.data.push(s);
    }
    return Array.from(map.values()).map(({ horseName, data }) => ({
      title: horseName,
      data,
    }));
  }, [supplements]);

  const openDeliveryModal = (item: Supplement) => {
    setDeliveryTarget(item);
    setDeliveryQty('');
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryTarget) return;
    const qty = parseFloat(deliveryQty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid', 'Please enter a valid quantity.');
      return;
    }
    setRecording(true);
    try {
      await recordDelivery(deliveryTarget.id, qty);
      setDeliveryTarget(null);
    } catch {
      Alert.alert('Error', 'Could not record delivery.');
    } finally {
      setRecording(false);
    }
  };

  const handleDelete = (item: Supplement) => {
    Alert.alert(
      'Delete Supplement',
      `Delete ${item.name} for ${item.horseName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSupplement(item.id);
            } catch {
              Alert.alert('Error', 'Could not delete supplement.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Supplement }) => {
    const color = stockColor(item);
    const label = stockLabel(item);
    const hasSubscription = item.subscription?.isActive;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.supplementName}>{item.name}</Text>
            {hasSubscription && (
              <View style={styles.subBadge}>
                <Text style={styles.subBadgeText}>Auto-delivery</Text>
              </View>
            )}
          </View>
          <View style={[styles.stockBadge, { backgroundColor: color + '20' }]}>
            <View style={[styles.stockDot, { backgroundColor: color }]} />
            <Text style={[styles.stockLabel, { color }]}>{label}</Text>
          </View>
        </View>

        {item.brand ? (
          <Text style={styles.brand}>{item.brand}</Text>
        ) : null}

        <View style={styles.detailRow}>
          <Text style={styles.detail}>
            {item.dosage} · {FREQUENCY_LABELS[item.frequency]}
          </Text>
          <Text style={styles.detail}>
            {item.currentStock} {UNIT_LABELS[item.stockUnit]} remaining
          </Text>
        </View>

        {hasSubscription && item.subscription?.nextDeliveryDate ? (
          <Text style={styles.nextDelivery}>
            Next delivery: {item.subscription.nextDeliveryDate}
          </Text>
        ) : null}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.deliveryBtn}
            onPress={() => openDeliveryModal(item)}
          >
            <Ionicons name="cube-outline" size={14} color={colors.primary.main} />
            <Text style={styles.deliveryBtnText}>Received</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('SupplementForm', { supplement: item })}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={14} color={colors.error.main} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  if (loading && supplements.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={
            supplements.length === 0 ? styles.emptyContainer : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={colors.primary.main}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="nutrition-outline" size={56} color={colors.gray[300]} />
              <Text style={styles.emptyTitle}>No supplements yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap + to add a supplement for a horse
              </Text>
            </View>
          }
          stickySectionHeadersEnabled={false}
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('SupplementForm', undefined)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>

      {/* Record Delivery Modal */}
      <Modal
        visible={deliveryTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setDeliveryTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Record Delivery</Text>
            {deliveryTarget && (
              <Text style={styles.modalSubtitle}>
                {deliveryTarget.name} for {deliveryTarget.horseName}
              </Text>
            )}

            <Text style={styles.label}>
              Quantity received ({deliveryTarget ? UNIT_LABELS[deliveryTarget.stockUnit] : ''})
            </Text>
            <TextInput
              style={styles.input}
              value={deliveryQty}
              onChangeText={setDeliveryQty}
              keyboardType="numeric"
              placeholder="e.g. 10"
              placeholderTextColor={colors.text.hint}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeliveryTarget(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, recording && styles.btnDisabled]}
                onPress={handleConfirmDelivery}
                disabled={recording}
              >
                {recording ? (
                  <ActivityIndicator color={colors.primary.contrast} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Record</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.paper,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 96,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: colors.error.light,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: colors.common.white,
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.main,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.common.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  supplementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  subBadge: {
    backgroundColor: colors.info.light + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  subBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.info.dark,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  brand: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 4,
  },
  detail: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  nextDelivery: {
    fontSize: 12,
    color: colors.info.main,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  deliveryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary.light + '20',
    paddingVertical: 7,
    borderRadius: 8,
  },
  deliveryBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary.main,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.gray[100],
    paddingVertical: 7,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  deleteBtn: {
    padding: 7,
    paddingHorizontal: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.common.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.gray[100],
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.primary.main,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary.contrast,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
