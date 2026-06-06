// src/screens/More/MoreScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';

interface MoreItem {
  label:       string;
  icon:        keyof typeof Ionicons.glyphMap;
  color:       string;
  route:       string;
  description: string;
}

// ── All colors are hardcoded hex — no dependency on colors.warning / colors.info
const MORE_ITEMS: MoreItem[] = [
  { label: 'Analytics',     icon: 'bar-chart-outline',    color: colors.primary, route: 'Analytics', description: 'Revenue & sales reports'  },
  { label: 'Settings',      icon: 'settings-outline',     color: '#8B5CF6',      route: 'Settings',  description: 'App & account settings'   },
  { label: 'Marketing',     icon: 'megaphone-outline',    color: '#F59E0B',      route: 'Marketing', description: 'Campaigns & coupons'      },
  { label: 'Store Profile', icon: 'storefront-outline',   color: '#10B981',      route: 'Store',     description: 'Manage your store'        },
  { label: 'Categories',    icon: 'grid-outline',         color: '#0891B2',      route: 'Categories',description: 'Product categories'       },
  { label: 'Low Stock',     icon: 'warning-outline',      color: colors.danger,  route: 'LowStock',  description: 'Items running low'        },
  { label: 'Reviews',       icon: 'star-outline',         color: '#F59E0B',      route: 'Reviews',   description: 'Customer feedback'        },
  { label: 'Messages',      icon: 'chatbubbles-outline',  color: '#EC4899',      route: 'Messages',  description: 'Customer messages'        },
];

export const MoreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[6] }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {MORE_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.gridItem}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <Card style={styles.itemCard}>
              <View style={[styles.itemIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={26} color={item.color} />
              </View>
              <Text style={[styles.itemLabel, { color: themeColors.text }]}>{item.label}</Text>
              <Text style={[styles.itemDesc, { color: themeColors.textSecondary }]} numberOfLines={1}>
                {item.description}
              </Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: spacing[4] },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  gridItem:  { width: '47%' },
  itemCard: {
    alignItems:        'center',
    paddingVertical:   spacing[5],
    paddingHorizontal: spacing[4],
    gap:               spacing[2],
  },
  itemIcon: {
    width:          56,
    height:         56,
    borderRadius:   radii.xl,
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   spacing[1],
  },
  itemLabel: {
    fontSize:   typography.sizes.base,
    fontWeight: typography.weights.semiBold,
    textAlign:  'center',
  },
  itemDesc: {
    fontSize:  typography.sizes.xs,
    textAlign: 'center',
  },
});