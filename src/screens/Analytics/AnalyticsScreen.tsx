// src/screens/Analytics/AnalyticsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography, spacing, radii } from '../../theme/typography';
import { useTheme } from '../../theme/ThemeContext';
import { mockRevenueData, mockSalesData, mockStats } from '../../utils/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing[4] * 2 - spacing[5] * 2;

const PERIODS = ['7D', '1M', '3M', '1Y'];

const MetricCard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: keyof typeof Ionicons.glyphMap;
}> = ({ title, value, change, icon }) => {
  const { colors: themeColors } = useTheme();
  const isPos = change >= 0;
  return (
    <Card style={styles.metricCard}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.metricValue, { color: themeColors.text }]}>{value}</Text>
      <Text style={[styles.metricTitle, { color: themeColors.textSecondary }]}>{title}</Text>
      <View style={[styles.changePill, { backgroundColor: isPos ? colors.successLight : colors.dangerLight }]}>
        <Ionicons name={isPos ? 'arrow-up' : 'arrow-down'} size={10} color={isPos ? colors.success : colors.danger} />
        <Text style={[styles.changeText, { color: isPos ? colors.success : colors.danger }]}>
          {Math.abs(change)}%
        </Text>
      </View>
    </Card>
  );
};

// Simple bar chart drawn with Views
const SimpleBarChart: React.FC<{ data: number[]; labels: string[]; color: string }> = ({
  data, labels, color,
}) => {
  const { colors: themeColors } = useTheme();
  const max = Math.max(...data);
  const chartH = 120;

  return (
    <View style={styles.barChart}>
      <View style={styles.bars}>
        {data.map((val, i) => (
          <View key={i} style={styles.barCol}>
            <View style={[styles.barBg, { height: chartH }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (val / max) * chartH,
                    backgroundColor: color,
                    opacity: i === data.length - 1 ? 1 : 0.6,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: themeColors.textSecondary }]}>{labels[i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Simple line chart drawn with Views
const SimpleLineChart: React.FC<{
  data: number[];
  labels: string[];
  color: string;
}> = ({ data, labels, color }) => {
  const { colors: themeColors } = useTheme();
  const max = Math.max(...data);
  const chartH = 80;
  const barW = Math.max((CHART_WIDTH - 32) / data.length - 4, 8);

  return (
    <View>
      <View style={styles.lineChartContainer}>
        {data.map((val, i) => {
          const h = (val / max) * chartH;
          return (
            <View key={i} style={[styles.lineBar, { width: barW }]}>
              <View style={{ height: chartH, justifyContent: 'flex-end' }}>
                <View style={{ height: h, backgroundColor: color, borderRadius: 3, opacity: 0.8 }} />
              </View>
              {i % 2 === 0 && (
                <Text style={[styles.lineLabel, { color: themeColors.textSecondary }]}>{labels[i]}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const AnalyticsScreen: React.FC = () => {
  const { colors: themeColors } = useTheme();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('1M');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing[6] }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Period Selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            style={[
              styles.periodBtn,
              {
                backgroundColor: period === p ? colors.primary : themeColors.card,
                borderColor: period === p ? colors.primary : themeColors.border,
              },
            ]}
          >
            <Text style={[styles.periodText, { color: period === p ? colors.white : themeColors.textSecondary }]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Metric Cards */}
      <View style={styles.metrics}>
        <MetricCard
          title="Revenue"
          value={`$${(mockStats.totalRevenue / 1000).toFixed(1)}k`}
          change={mockStats.revenueChange}
          icon="cash-outline"
        />
        <MetricCard
          title="Orders"
          value={mockStats.totalOrders.toString()}
          change={mockStats.ordersChange}
          icon="cart-outline"
        />
        <MetricCard
          title="Customers"
          value={mockStats.totalCustomers.toString()}
          change={mockStats.customersChange}
          icon="people-outline"
        />
        <MetricCard
          title="Conversion"
          value="3.4%"
          change={0.8}
          icon="trending-up-outline"
        />
      </View>

      {/* Revenue Chart */}
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: themeColors.text }]}>Revenue Overview</Text>
        <Text style={[styles.chartSub, { color: themeColors.textSecondary }]}>Monthly revenue vs expenses</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: themeColors.textSecondary }]}>Revenue</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.chart2 }]} />
            <Text style={[styles.legendText, { color: themeColors.textSecondary }]}>Expenses</Text>
          </View>
        </View>
        <SimpleBarChart
          data={mockRevenueData.datasets[0].data}
          labels={mockRevenueData.labels}
          color={colors.primary}
        />
      </Card>

      {/* Sales Chart */}
      <Card style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: themeColors.text }]}>Sales This Week</Text>
        <Text style={[styles.chartSub, { color: themeColors.textSecondary }]}>Daily sales performance</Text>
        <SimpleLineChart
          data={mockSalesData.datasets[0].data}
          labels={mockSalesData.labels}
          color={colors.success}
        />
      </Card>

      {/* Top Categories */}
      <Card>
        <Text style={[styles.chartTitle, { color: themeColors.text }]}>Top Categories</Text>
        <View style={styles.categories}>
          {[
            { name: 'Electronics', value: 42, color: colors.primary },
            { name: 'Accessories', value: 31, color: colors.success },
            { name: 'Peripherals', value: 18, color: colors.warning },
            { name: 'Audio', value: 9, color: colors.danger },
          ].map((cat) => (
            <View key={cat.name} style={styles.catRow}>
              <View style={styles.catInfo}>
                <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.catName, { color: themeColors.text }]}>{cat.name}</Text>
              </View>
              <View style={[styles.catBarBg, { backgroundColor: themeColors.border }]}>
                <View style={[styles.catBar, { width: `${cat.value}%`, backgroundColor: cat.color }]} />
              </View>
              <Text style={[styles.catPct, { color: themeColors.textSecondary }]}>{cat.value}%</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing[4], gap: spacing[4] },
  periodRow: { flexDirection: 'row', gap: spacing[2] },
  periodBtn: {
    paddingHorizontal: spacing[4],
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
  },
  periodText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semiBold },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  metricCard: {
    flex: 1,
    minWidth: '44%',
    gap: spacing[1],
    padding: spacing[4],
  },
  metricValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    marginTop: spacing[1],
  },
  metricTitle: { fontSize: typography.sizes.sm },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
    marginTop: spacing[1],
  },
  changeText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semiBold },
  chartCard: { marginBottom: 0 },
  chartTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semiBold },
  chartSub: { fontSize: typography.sizes.sm, marginTop: 2, marginBottom: spacing[3] },
  legend: { flexDirection: 'row', gap: spacing[4], marginBottom: spacing[3] },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: typography.sizes.sm },
  barChart: { marginTop: spacing[2] },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  barCol: { flex: 1, alignItems: 'center' },
  barBg: { width: '100%', justifyContent: 'flex-end', borderRadius: 4 },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 8, marginTop: 4 },
  lineChartContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: spacing[2] },
  lineBar: { alignItems: 'center' },
  lineLabel: { fontSize: 8, marginTop: 4 },
  categories: { marginTop: spacing[3], gap: spacing[3] },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], width: 90 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  catBarBg: { flex: 1, height: 8, borderRadius: radii.full, overflow: 'hidden' },
  catBar: { height: '100%', borderRadius: radii.full },
  catPct: { fontSize: typography.sizes.sm, width: 36, textAlign: 'right' },
});