/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles,
  Droplet,
  Sun,
  Heart,
  Wind,
  Coffee,
  Book,
  Moon,
  Smile,
  Activity,
  ArrowRight,
  Target,
} from 'lucide-react';
import { Habit, HabitLog } from '../types';

interface HabitTrendsProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  accentColor?: string;
  onNavigateToCare?: () => void;
}

// Icon mapper helper
const getHabitIconComponent = (iconName?: string) => {
  switch (iconName) {
    case 'droplet':
      return Droplet;
    case 'wind':
      return Wind;
    case 'sun':
      return Sun;
    case 'heart':
      return Heart;
    case 'coffee':
      return Coffee;
    case 'book':
      return Book;
    case 'moon':
      return Moon;
    case 'smile':
      return Smile;
    case 'activity':
      return Activity;
    default:
      return Sparkles;
  }
};

interface TooltipPayloadItem {
  value: number;
  name: string;
  payload: {
    day?: string;
    weekLabel?: string;
    monthLabel?: string;
    rate: number;
    completed?: number;
    total?: number;
    dateRange?: string;
    fullDate?: string;
    totalTargetProgress?: number;
    totalTargetGoal?: number;
    activeDaysLogged?: number;
    daysInMonth?: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const title = data.day
      ? `${data.day} (${data.fullDate})`
      : data.weekLabel
      ? data.weekLabel
      : data.monthLabel;

    return (
      <div className="bg-[#2C2018] text-[#F9F6F0] p-3 rounded-2xl shadow-xl border border-neutral-700 text-xs space-y-1 font-sans">
        <div className="font-serif font-bold text-sm text-[#F4ECDD]">
          {title}
        </div>
        {data.dateRange && (
          <div className="text-[10px] text-neutral-300 font-mono">
            {data.dateRange}
          </div>
        )}
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-700 mt-1">
          <span className="w-2 h-2 rounded-full bg-[#94A47A]" />
          <span className="text-neutral-300">Goal Completion Rate:</span>
          <span className="font-mono font-bold text-emerald-300">{data.rate}%</span>
        </div>
        {data.completed !== undefined && data.total !== undefined && (
          <div className="text-[10.5px] text-neutral-300">
            Goals Reached: <span className="font-mono font-semibold text-white">{data.completed}</span> of{' '}
            <span className="font-mono text-neutral-400">{data.total}</span> opportunities
          </div>
        )}
        {data.activeDaysLogged !== undefined && (
          <div className="text-[10px] text-neutral-400 font-serif italic pt-0.5">
            Active on {data.activeDaysLogged} days this month
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const HabitTrends: React.FC<HabitTrendsProps> = ({
  habits,
  habitLogs,
  accentColor = '#94A47A',
  onNavigateToCare,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Today ISO date
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper to extract numeric progress for a habit on a date
  const getHabitCountForDate = (habitId: string, dateStr: string): number => {
    const log = habitLogs.find((l) => l.habitId === habitId && l.date === dateStr);
    return log?.count ?? (log ? 1 : 0);
  };

  // 1. Calculate Daily Breakdown for the Current 7 Days (last 7 days)
  const dailyData = useMemo(() => {
    const days = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayLabels[d.getDay()];
      const dayNum = d.getDate();
      const isToday = dateStr === todayStr;

      // Count habits where daily target was fully met
      const completed = habits.filter((h) => {
        const target = Math.max(1, h.targetFrequency || 1);
        const count = getHabitCountForDate(h.id, dateStr);
        return count >= target;
      }).length;

      let totalTargetGoal = 0;
      let totalTargetProgress = 0;
      habits.forEach((h) => {
        const target = Math.max(1, h.targetFrequency || 1);
        const count = getHabitCountForDate(h.id, dateStr);
        totalTargetGoal += target;
        totalTargetProgress += Math.min(target, count);
      });

      const total = habits.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

      days.push({
        day: dayName,
        dayNum,
        fullDate: dateStr,
        label: `${dayName} ${dayNum}`,
        completed,
        total,
        totalTargetGoal,
        totalTargetProgress,
        rate,
        isToday,
      });
    }
    return days;
  }, [habits, habitLogs, todayStr]);

  // 2. Calculate Weekly Completion Rates for Past 4 Weeks
  const weeklyData = useMemo(() => {
    const weeks = [];
    const now = new Date();

    for (let w = 3; w >= 0; w--) {
      const endOffset = w * 7;
      const startOffset = endOffset + 6;

      const startDate = new Date();
      startDate.setDate(now.getDate() - startOffset);
      const endDate = new Date();
      endDate.setDate(now.getDate() - endOffset);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const startFormat = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFormat = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dateRange = `${startFormat} – ${endFormat}`;
      const weekLabel = w === 0 ? 'This Week' : `Week -${w}`;

      let totalPossible = 0;
      let totalCompleted = 0;

      for (let d = 0; d < 7; d++) {
        const cur = new Date(startDate);
        cur.setDate(startDate.getDate() + d);
        const curStr = cur.toISOString().split('T')[0];

        if (curStr > todayStr) continue;

        totalPossible += habits.length;
        const doneToday = habits.filter((h) => {
          const target = Math.max(1, h.targetFrequency || 1);
          const count = getHabitCountForDate(h.id, curStr);
          return count >= target;
        }).length;

        totalCompleted += doneToday;
      }

      const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      weeks.push({
        weekLabel,
        dateRange,
        rate,
        completed: totalCompleted,
        total: totalPossible,
        isCurrentWeek: w === 0,
      });
    }

    return weeks;
  }, [habits, habitLogs, todayStr]);

  // 3. Calculate Monthly Breakdown for the Past 6 Months (Long-Term Consistency)
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let m = 5; m >= 0; m--) {
      // Create date object pointing to that month
      const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const year = targetMonthDate.getFullYear();
      const month = targetMonthDate.getMonth();

      // Month name
      const monthName = targetMonthDate.toLocaleDateString('en-US', { month: 'short' });
      const fullMonthName = targetMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const monthLabel = m === 0 ? 'This Month' : monthName;

      // Determine days in this month
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Cap at today's day if current month
      const isCurrentMonth = m === 0;
      const lastDayToCount = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;

      let totalPossible = 0;
      let totalCompleted = 0;
      let activeDaysLogged = 0;

      for (let day = 1; day <= lastDayToCount; day++) {
        const dayDate = new Date(year, month, day);
        const dayStr = dayDate.toISOString().split('T')[0];

        totalPossible += habits.length;

        // Check if any habit was completed or logged on this day
        let dayHasAnyLog = false;
        let dayCompletedCount = 0;

        habits.forEach((h) => {
          const target = Math.max(1, h.targetFrequency || 1);
          const count = getHabitCountForDate(h.id, dayStr);
          if (count > 0) dayHasAnyLog = true;
          if (count >= target) {
            dayCompletedCount += 1;
          }
        });

        if (dayHasAnyLog) {
          activeDaysLogged += 1;
        }
        totalCompleted += dayCompletedCount;
      }

      const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      months.push({
        monthLabel,
        monthName,
        fullMonthName,
        dateRange: `${monthName} 1 – ${monthName} ${lastDayToCount}, ${year}`,
        rate,
        completed: totalCompleted,
        total: totalPossible,
        daysInMonth: lastDayToCount,
        activeDaysLogged,
        isCurrentMonth,
      });
    }

    return months;
  }, [habits, habitLogs, todayStr]);

  // 4. Per-Habit Completion Rate (Adapts context based on viewMode)
  const perHabitStats = useMemo(() => {
    return habits.map((habit) => {
      const targetGoal = Math.max(1, habit.targetFrequency || 1);

      // Check last 7 days count
      let completedDays7 = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = getHabitCountForDate(habit.id, dateStr);
        if (count >= targetGoal) {
          completedDays7 += 1;
        }
      }
      const weeklyRate = Math.round((completedDays7 / 7) * 100);

      // Check current calendar month completions
      const now = new Date();
      const currentMonthDays = now.getDate();
      let completedDaysMonth = 0;
      let totalCountMonth = 0;

      for (let day = 1; day <= currentMonthDays; day++) {
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        const dateStr = d.toISOString().split('T')[0];
        const count = getHabitCountForDate(habit.id, dateStr);
        totalCountMonth += count;
        if (count >= targetGoal) {
          completedDaysMonth += 1;
        }
      }
      const monthlyRate = currentMonthDays > 0 ? Math.round((completedDaysMonth / currentMonthDays) * 100) : 0;

      const todayCount = getHabitCountForDate(habit.id, todayStr);
      const isDoneToday = todayCount >= targetGoal;

      return {
        habit,
        targetGoal,
        todayCount,
        completedDays7,
        weeklyRate,
        completedDaysMonth,
        monthlyRate,
        currentMonthDays,
        totalCountMonth,
        isDoneToday,
      };
    });
  }, [habits, habitLogs, todayStr]);

  // 5. Overall Summary Statistics
  const thisWeekAvgRate = useMemo(() => {
    if (dailyData.length === 0 || habits.length === 0) return 0;
    const sumRate = dailyData.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sumRate / dailyData.length);
  }, [dailyData, habits]);

  const currentMonthAvgRate = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const currentM = monthlyData[monthlyData.length - 1];
    return currentM?.rate || 0;
  }, [monthlyData]);

  const totalFulfilledThisWeek = useMemo(() => {
    return dailyData.reduce((acc, curr) => acc + curr.completed, 0);
  }, [dailyData]);

  const totalFulfilledThisMonth = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const currentM = monthlyData[monthlyData.length - 1];
    return currentM?.completed || 0;
  }, [monthlyData]);

  const bestPeriod = useMemo(() => {
    if (viewMode === 'monthly') {
      const sorted = [...monthlyData].sort((a, b) => b.rate - a.rate);
      return { label: sorted[0]?.monthName || 'This Month', rate: sorted[0]?.rate || 0 };
    }
    if (viewMode === 'weekly') {
      const sorted = [...weeklyData].sort((a, b) => b.rate - a.rate);
      return { label: sorted[0]?.weekLabel || 'This Week', rate: sorted[0]?.rate || 0 };
    }
    const sorted = [...dailyData].sort((a, b) => b.rate - a.rate);
    return { label: sorted[0]?.label || 'Today', rate: sorted[0]?.rate || 0 };
  }, [viewMode, dailyData, weeklyData, monthlyData]);

  if (habits.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-neutral-200/70 p-8 sm:p-10 text-center space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#94A47A]/10 text-[#627546] border border-[#94A47A]/20 flex items-center justify-center mx-auto">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-[#2C2018]">
            No Habits Established Yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-sans">
            To view completion trends and monthly progression, cultivate gentle daily rituals in the Care screen.
          </p>
        </div>
        {onNavigateToCare && (
          <button
            onClick={onNavigateToCare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-serif font-bold text-white bg-[#94A47A] hover:bg-[#83946a] shadow-xs transition"
          >
            <span>Open Self-Care Habits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-white/85 backdrop-blur-md rounded-[28px] border border-neutral-200/70 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="washi-tape washi-tape-sage -top-2 left-6" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#94A47A]/15 text-[#627546] border border-[#94A47A]/30 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Habit Trends
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {habits.length} Active {habits.length === 1 ? 'Habit' : 'Habits'}
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2018]">
              {viewMode === 'monthly'
                ? 'Monthly Consistency & Long-Term Trends'
                : viewMode === 'weekly'
                ? '4-Week Progression Trajectory'
                : '7-Day Daily Breakdown'}
            </h3>
            <p className="text-xs text-neutral-600 max-w-md leading-relaxed font-sans">
              {viewMode === 'monthly'
                ? 'Observe how your gentle daily rituals compound across months. Long-term patterns reveal quiet resilience.'
                : 'Track how rhythmic micro-actions blossom over time. Progress here measures self-kindness, not rigid discipline.'}
            </p>
          </div>

          {/* Toggle between 7-Day Daily, 4-Week Progression, and Monthly View */}
          <div className="flex items-center p-1 bg-neutral-100 rounded-full border border-neutral-200/80 shrink-0">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 rounded-full text-xs font-serif transition-all ${
                viewMode === 'daily'
                  ? 'bg-white text-[#2C2018] shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              7-Day
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1 rounded-full text-xs font-serif transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white text-[#2C2018] shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              4-Week
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded-full text-xs font-serif transition-all ${
                viewMode === 'monthly'
                  ? 'bg-white text-[#2C2018] shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Monthly View
            </button>
          </div>
        </div>

        {/* Quick Highlights Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-neutral-100">
          <div className="bg-[#F9F6F0]/80 p-3 rounded-2xl border border-neutral-200/60">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block">
              {viewMode === 'monthly' ? 'This Month Avg' : '7-Day Avg Rate'}
            </span>
            <span className="text-base font-serif font-bold text-[#2C2018]">
              {viewMode === 'monthly' ? `${currentMonthAvgRate}%` : `${thisWeekAvgRate}%`}
            </span>
            <span className="text-[9.5px] text-neutral-400 block font-serif italic">
              {viewMode === 'monthly' ? 'Month-to-date average' : 'Across all daily targets'}
            </span>
          </div>

          <div className="bg-[#F9F6F0]/80 p-3 rounded-2xl border border-neutral-200/60">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block">
              Goals Fulfilled
            </span>
            <span className="text-base font-serif font-bold text-[#627546]">
              {viewMode === 'monthly' ? totalFulfilledThisMonth : totalFulfilledThisWeek}
            </span>
            <span className="text-[9.5px] text-neutral-400 block font-serif italic">
              {viewMode === 'monthly' ? 'Fulfillments this month' : 'In past 7 days'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#F9F6F0]/80 p-3 rounded-2xl border border-neutral-200/60">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-sans block">
              Best {viewMode === 'monthly' ? 'Month' : viewMode === 'weekly' ? 'Week' : 'Day'}
            </span>
            <span className="text-base font-serif font-bold text-[#C67C58]">
              {bestPeriod.label}
            </span>
            <span className="text-[9.5px] text-neutral-400 block font-serif italic">
              {bestPeriod.rate}% goal completion
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-[28px] border border-neutral-200/70 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#94A47A]" />
            <h4 className="font-serif text-sm font-bold text-[#2C2018]">
              {viewMode === 'daily'
                ? 'Daily Completion Rates (Past 7 Days)'
                : viewMode === 'weekly'
                ? '4-Week Completion Trajectory'
                : 'Monthly Habit Completion (Past 6 Months)'}
            </h4>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {viewMode === 'daily'
              ? 'Goal Rate % per day'
              : viewMode === 'weekly'
              ? 'Avg Rate % per 7-day window'
              : 'Avg Completion Rate % by Month'}
          </span>
        </div>

        {/* Recharts Container */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'daily' ? (
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tick={{ fill: '#737373', fontSize: 11, fontFamily: 'serif' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="rate" radius={[8, 8, 2, 2]}>
                  {dailyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.isToday
                          ? '#C67C58'
                          : entry.rate >= 80
                          ? '#627546'
                          : entry.rate >= 40
                          ? '#94A47A'
                          : '#C8CEBE'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : viewMode === 'weekly' ? (
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="habitRateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A47A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#94A47A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis
                  dataKey="weekLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tick={{ fill: '#737373', fontSize: 11, fontFamily: 'serif' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#627546"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#habitRateGradient)"
                  dot={{ r: 4, fill: '#94A47A', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#2C2018', strokeWidth: 2, stroke: '#FFFFFF' }}
                />
              </AreaChart>
            ) : (
              /* MONTHLY VIEW: Bar chart grouped by month with custom cell highlights */
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis
                  dataKey="monthName"
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tick={{ fill: '#737373', fontSize: 11, fontFamily: 'serif' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tick={{ fill: '#737373', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="rate" radius={[8, 8, 2, 2]}>
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`month-cell-${index}`}
                      fill={
                        entry.isCurrentMonth
                          ? '#C67C58'
                          : entry.rate >= 75
                          ? '#627546'
                          : entry.rate >= 40
                          ? '#94A47A'
                          : '#D4DACB'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Info Helper for Month Mode */}
        {viewMode === 'monthly' && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[10px] text-neutral-500 font-sans">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#C67C58]" /> Current Month
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#627546]" /> Strong Consistency (75%+)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#94A47A]" /> Steady Rhythm (40–74%)
              </span>
            </div>
            <span className="font-mono text-neutral-400">
              Aggregated across 6-month window
            </span>
          </div>
        )}
      </div>

      {/* Per-Habit Breakdown Card */}
      <div className="bg-white/85 backdrop-blur-md rounded-[28px] border border-neutral-200/70 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-sm font-bold text-[#2C2018] flex items-center gap-2">
            <span>
              {viewMode === 'monthly'
                ? 'Per-Habit Monthly Completion Rates'
                : 'Per-Habit Weekly Completion Rates'}
            </span>
            <span className="text-[11px] font-mono font-normal text-neutral-400">
              ({habits.length} active)
            </span>
          </h4>
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-mono">
            {viewMode === 'monthly' ? 'Month-to-Date Window' : '7-Day Window'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {perHabitStats.map(({
            habit,
            targetGoal,
            todayCount,
            completedDays7,
            weeklyRate,
            completedDaysMonth,
            monthlyRate,
            currentMonthDays,
            isDoneToday,
          }) => {
            const IconComponent = getHabitIconComponent(habit.icon);
            const activeRate = viewMode === 'monthly' ? monthlyRate : weeklyRate;
            const activeCountLabel =
              viewMode === 'monthly'
                ? `${completedDaysMonth} / ${currentMonthDays} days met this month`
                : `${completedDays7} / 7 days met this week`;

            return (
              <div
                key={habit.id}
                className="p-3.5 bg-[#F9F6F0]/70 rounded-2xl border border-neutral-200/60 flex flex-col justify-between gap-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-[#94A47A]">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-serif font-bold text-[#2C2018] truncate">
                        {habit.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-neutral-400">
                          {habit.category || 'wellness'}
                        </span>
                        {targetGoal > 1 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-white/80 text-neutral-500 border border-neutral-200">
                            Goal: {targetGoal} {habit.unit || 'times'}/day
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#2C2018]">
                      {activeRate}%
                    </span>
                    <span className="block text-[9px] text-neutral-400 font-serif italic">
                      {activeCountLabel}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeRate}%`,
                      backgroundColor: activeRate >= 70 ? '#627546' : activeRate >= 40 ? '#94A47A' : '#C67C58',
                    }}
                  />
                </div>

                {/* Today's status */}
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-200/40">
                  <span>Today: {todayCount} / {targetGoal} {habit.unit || 'times'}</span>
                  {isDoneToday ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Goal Reached
                    </span>
                  ) : (
                    <span className="text-neutral-400">
                      {Math.max(0, targetGoal - todayCount)} remaining
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HabitTrends;
