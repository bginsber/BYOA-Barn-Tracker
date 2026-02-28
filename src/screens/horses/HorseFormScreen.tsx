import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import { Horse, HorseFormData, HorsesStackParamList } from '../../types';
import { horseService } from '../../services/horseService';

type NavProp = NativeStackNavigationProp<HorsesStackParamList, 'HorseForm'>;
type RoutePropType = RouteProp<HorsesStackParamList, 'HorseForm'>;

export const HorseFormScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const existing = route.params?.horse as Horse | undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [age, setAge] = useState(existing?.age?.toString() ?? '');
  const [weight, setWeight] = useState(existing?.weight?.toString() ?? '');
  const [color, setColor] = useState(existing?.color ?? '');
  const [stall, setStall] = useState(existing?.stall ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isEdit = !!existing;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a horse name.');
      return;
    }

    const data: HorseFormData = {
      name: name.trim(),
      breed: breed.trim() || undefined,
      age: age ? parseInt(age, 10) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      color: color.trim() || undefined,
      stall: stall.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await horseService.updateHorse(existing.id, data);
      } else {
        await horseService.createHorse(data);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save horse.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert(
      'Remove Horse',
      `Remove ${existing.name} from the barn? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await horseService.deleteHorse(existing.id);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Could not remove horse.');
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horse Details</Text>

          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Horse name"
            placeholderTextColor={colors.text.hint}
          />

          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g. Thoroughbred, Quarter Horse"
            placeholderTextColor={colors.text.hint}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Age (years)</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 8"
                keyboardType="numeric"
                placeholderTextColor={colors.text.hint}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="e.g. 1150"
                keyboardType="numeric"
                placeholderTextColor={colors.text.hint}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Color</Text>
              <TextInput
                style={styles.input}
                value={color}
                onChangeText={setColor}
                placeholder="e.g. Bay, Chestnut"
                placeholderTextColor={colors.text.hint}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Stall #</Text>
              <TextInput
                style={styles.input}
                value={stall}
                onChangeText={setStall}
                placeholder="e.g. 4"
                placeholderTextColor={colors.text.hint}
              />
            </View>
          </View>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any notes about this horse..."
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.text.hint}
          />
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
              {isEdit ? 'Save Changes' : 'Add Horse'}
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
              <Text style={styles.deleteBtnText}>Remove Horse</Text>
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 4,
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
