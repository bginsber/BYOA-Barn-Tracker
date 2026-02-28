import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useHorses } from '../../hooks/useHorses';
import { colors } from '../../theme/colors';
import { Horse, HorsesStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<HorsesStackParamList, 'HorsesList'>;

export const HorsesScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { horses, loading, error, refresh, deleteHorse } = useHorses();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleDelete = (horse: Horse) => {
    Alert.alert(
      'Remove Horse',
      `Remove ${horse.name} from the barn?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHorse(horse.id);
            } catch {
              Alert.alert('Error', 'Could not remove horse. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderHorse = ({ item }: { item: Horse }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.horseBadge}>
          <Text style={styles.horseBadgeText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.horseInfo}>
          <Text style={styles.horseName}>{item.name}</Text>
          <Text style={styles.horseMeta}>
            {[item.breed, item.stall ? `Stall ${item.stall}` : null]
              .filter(Boolean)
              .join(' · ') || 'No details'}
          </Text>
          {(item.age || item.weight) ? (
            <Text style={styles.horseMeta2}>
              {[
                item.age ? `${item.age} yrs` : null,
                item.weight ? `${item.weight} lbs` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('HorseForm', { horse: item })}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && horses.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={horses}
        keyExtractor={item => item.id}
        renderItem={renderHorse}
        contentContainerStyle={horses.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={colors.primary.main}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="paw-outline" size={56} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No horses yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to add your first horse
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('HorseForm', undefined)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.primary.contrast} />
      </TouchableOpacity>
    </View>
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
  card: {
    backgroundColor: colors.common.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.common.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  horseBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horseBadgeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.contrast,
  },
  horseInfo: {
    flex: 1,
    gap: 2,
  },
  horseName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  horseMeta: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  horseMeta2: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
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
});
