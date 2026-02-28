import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useShavings } from '../../hooks/useShavings';
import { colors } from '../../theme/colors';
import { ShavingsDelivery } from '../../types';

type StockStatus = 'stocked' | 'low' | 'order_now' | 'pending_order';

function getStatus(inv: { currentBags: number; reorderThreshold: number; pendingOrderDate?: string } | null): StockStatus {
  if (!inv) return 'order_now';
  if (inv.pendingOrderDate) return 'pending_order';
  if (inv.currentBags <= 0) return 'order_now';
  if (inv.currentBags <= inv.reorderThreshold) return 'low';
  return 'stocked';
}

const STATUS_CONFIG: Record<StockStatus, { label: string; bg: string; text: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  stocked: { label: 'Well stocked', bg: colors.success.light + '20', text: colors.success.dark, icon: 'checkmark-circle-outline' },
  low: { label: 'Running low — consider ordering', bg: colors.warning.light + '30', text: colors.warning.dark, icon: 'alert-circle-outline' },
  order_now: { label: 'Order now!', bg: colors.error.light + '20', text: colors.error.dark, icon: 'warning-outline' },
  pending_order: { label: 'Order placed — awaiting delivery', bg: colors.info.light + '20', text: colors.info.dark, icon: 'time-outline' },
};

export const ShavingsScreen = () => {
  const { inventory, deliveries, loading, error, refresh, upsertInventory, recordDelivery, markOrderPlaced } =
    useShavings();

  // Settings edit mode
  const [editingSettings, setEditingSettings] = useState(false);
  const [currentBagsInput, setCurrentBagsInput] = useState('');
  const [reorderThresholdInput, setReorderThresholdInput] = useState('');
  const [bagsPerOrderInput, setBagsPerOrderInput] = useState('');
  const [supplierInput, setSupplierInput] = useState('');
  const [costPerBagInput, setCostPerBagInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Delivery modal
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [deliveryBags, setDeliveryBags] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [recordingDelivery, setRecordingDelivery] = useState(false);

  // Order modal
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [expectedDate, setExpectedDate] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const startEditSettings = () => {
    setCurrentBagsInput(inventory?.currentBags?.toString() ?? '0');
    setReorderThresholdInput(inventory?.reorderThreshold?.toString() ?? '10');
    setBagsPerOrderInput(inventory?.bagsPerOrder?.toString() ?? '');
    setSupplierInput(inventory?.supplier ?? '');
    setCostPerBagInput(inventory?.costPerBag?.toString() ?? '');
    setEditingSettings(true);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await upsertInventory({
        currentBags: parseFloat(currentBagsInput) || 0,
        reorderThreshold: parseFloat(reorderThresholdInput) || 10,
        bagsPerOrder: parseFloat(bagsPerOrderInput) || 0,
        supplier: supplierInput.trim() || undefined,
        costPerBag: costPerBagInput ? parseFloat(costPerBagInput) : undefined,
      });
      setEditingSettings(false);
    } catch {
      Alert.alert('Error', 'Could not save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleRecordDelivery = async () => {
    const bags = parseFloat(deliveryBags);
    if (isNaN(bags) || bags <= 0) {
      Alert.alert('Invalid', 'Please enter a valid number of bags.');
      return;
    }
    const date = deliveryDate.trim() || new Date().toISOString().split('T')[0];

    setRecordingDelivery(true);
    try {
      await recordDelivery(bags, date, inventory?.supplier, deliveryNotes.trim() || undefined);
      setDeliveryModalVisible(false);
      setDeliveryBags('');
      setDeliveryDate('');
      setDeliveryNotes('');
    } catch {
      Alert.alert('Error', 'Could not record delivery.');
    } finally {
      setRecordingDelivery(false);
    }
  };

  const handleMarkOrderPlaced = async () => {
    setPlacingOrder(true);
    try {
      await markOrderPlaced(expectedDate.trim() || undefined);
      setOrderModalVisible(false);
      setExpectedDate('');
    } catch {
      Alert.alert('Error', 'Could not mark order as placed.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const status = getStatus(inventory);
  const statusConfig = STATUS_CONFIG[status];

  if (loading && !inventory) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary.main}
          />
        }
      >
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={22} color={statusConfig.text} />
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {statusConfig.label}
          </Text>
        </View>

        {/* Inventory Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Current Inventory</Text>
            {!editingSettings && (
              <TouchableOpacity onPress={startEditSettings} style={styles.editIconBtn}>
                <Ionicons name="settings-outline" size={18} color={colors.primary.main} />
              </TouchableOpacity>
            )}
          </View>

          {editingSettings ? (
            <View style={styles.settingsForm}>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Bags on hand</Text>
                  <TextInput
                    style={styles.input}
                    value={currentBagsInput}
                    onChangeText={setCurrentBagsInput}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.text.hint}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Reorder when below</Text>
                  <TextInput
                    style={styles.input}
                    value={reorderThresholdInput}
                    onChangeText={setReorderThresholdInput}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={colors.text.hint}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Bags per order</Text>
                  <TextInput
                    style={styles.input}
                    value={bagsPerOrderInput}
                    onChangeText={setBagsPerOrderInput}
                    keyboardType="numeric"
                    placeholder="e.g. 30"
                    placeholderTextColor={colors.text.hint}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Cost per bag ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={costPerBagInput}
                    onChangeText={setCostPerBagInput}
                    keyboardType="numeric"
                    placeholder="e.g. 8.50"
                    placeholderTextColor={colors.text.hint}
                  />
                </View>
              </View>
              <Text style={styles.label}>Supplier</Text>
              <TextInput
                style={styles.input}
                value={supplierInput}
                onChangeText={setSupplierInput}
                placeholder="e.g. Local farm store"
                placeholderTextColor={colors.text.hint}
              />
              <View style={styles.settingsActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditingSettings(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, savingSettings && styles.btnDisabled]}
                  onPress={handleSaveSettings}
                  disabled={savingSettings}
                >
                  {savingSettings ? (
                    <ActivityIndicator color={colors.primary.contrast} size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventory?.currentBags ?? 0}</Text>
                <Text style={styles.statLabel}>Bags on hand</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventory?.reorderThreshold ?? '—'}</Text>
                <Text style={styles.statLabel}>Reorder at</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventory?.bagsPerOrder ?? '—'}</Text>
                <Text style={styles.statLabel}>Per order</Text>
              </View>
            </View>
          )}

          {!editingSettings && (inventory?.supplier || inventory?.costPerBag) ? (
            <Text style={styles.supplierText}>
              {[
                inventory?.supplier,
                inventory?.costPerBag ? `$${inventory.costPerBag}/bag` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}

          {!editingSettings && inventory?.pendingOrderDate ? (
            <View style={styles.orderPending}>
              <Ionicons name="time-outline" size={14} color={colors.info.dark} />
              <Text style={styles.orderPendingText}>
                Order placed {inventory.pendingOrderDate}
                {inventory.expectedDeliveryDate
                  ? ` · Expected ${inventory.expectedDeliveryDate}`
                  : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setDeliveryModalVisible(true)}
          >
            <Ionicons name="cube-outline" size={20} color={colors.primary.main} />
            <Text style={styles.actionBtnText}>Record Delivery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, status === 'pending_order' && styles.actionBtnDisabled]}
            onPress={() => setOrderModalVisible(true)}
            disabled={status === 'pending_order'}
          >
            <Ionicons name="cart-outline" size={20} color={status === 'pending_order' ? colors.text.disabled : colors.primary.main} />
            <Text style={[styles.actionBtnText, status === 'pending_order' && { color: colors.text.disabled }]}>
              Mark Ordered
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delivery History */}
        {deliveries.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Deliveries</Text>
            {deliveries.map((d: ShavingsDelivery) => (
              <View key={d.id} style={styles.deliveryRow}>
                <View>
                  <Text style={styles.deliveryBags}>{d.bagsReceived} bags</Text>
                  {d.supplier ? (
                    <Text style={styles.deliverySupplier}>{d.supplier}</Text>
                  ) : null}
                  {d.notes ? <Text style={styles.deliveryNotes}>{d.notes}</Text> : null}
                </View>
                <Text style={styles.deliveryDate}>{d.deliveredAt}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Record Delivery Modal */}
      <Modal
        visible={deliveryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeliveryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Record Delivery</Text>

            <Text style={styles.label}>Bags received *</Text>
            <TextInput
              style={styles.input}
              value={deliveryBags}
              onChangeText={setDeliveryBags}
              keyboardType="numeric"
              placeholder="e.g. 30"
              placeholderTextColor={colors.text.hint}
              autoFocus
            />

            <Text style={styles.label}>Delivery date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={deliveryDate}
              onChangeText={setDeliveryDate}
              placeholder={new Date().toISOString().split('T')[0]}
              placeholderTextColor={colors.text.hint}
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              placeholder="Any notes..."
              placeholderTextColor={colors.text.hint}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeliveryModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, recordingDelivery && styles.btnDisabled]}
                onPress={handleRecordDelivery}
                disabled={recordingDelivery}
              >
                {recordingDelivery ? (
                  <ActivityIndicator color={colors.primary.contrast} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Record</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mark Order Placed Modal */}
      <Modal
        visible={orderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Mark Order Placed</Text>
            <Text style={styles.modalSubtitle}>
              {inventory?.supplier
                ? `Ordering from ${inventory.supplier}`
                : 'Order has been placed'}
              {inventory?.bagsPerOrder ? ` — ${inventory.bagsPerOrder} bags` : ''}
            </Text>

            <Text style={styles.label}>Expected delivery date (optional)</Text>
            <TextInput
              style={styles.input}
              value={expectedDate}
              onChangeText={setExpectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text.hint}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setOrderModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, placingOrder && styles.btnDisabled]}
                onPress={handleMarkOrderPlaced}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <ActivityIndicator color={colors.primary.contrast} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Confirm</Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  errorBanner: {
    backgroundColor: colors.error.light,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: colors.common.white,
    fontSize: 14,
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.common.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  editIconBtn: {
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.gray[200],
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  supplierText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  orderPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.info.light + '20',
    padding: 10,
    borderRadius: 8,
  },
  orderPendingText: {
    fontSize: 13,
    color: colors.info.dark,
    flex: 1,
  },
  settingsForm: {
    gap: 8,
  },
  settingsActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.common.white,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    gap: 8,
  },
  deliveryBags: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deliverySupplier: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  deliveryNotes: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  deliveryDate: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  // Shared form styles
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 4,
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
  // Modals
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
