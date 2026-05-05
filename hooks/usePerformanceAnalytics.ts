import { useState, useCallback, useMemo } from "react";

export interface PerformanceMetric {
  questionId: string;
  rating: number;
  timestamp: number;
  category: string;
  confidence?: number;
}

export interface PerformanceTrend {
  averageRating: number;
  highestRating: number;
  lowestRating: number;
  totalQuestions: number;
  categoryBreakdown: Record<string, number>;
  timeline: PerformanceMetric[];
}

interface UsePerformanceAnalyticsReturn {
  metrics: PerformanceMetric[];
  trend: PerformanceTrend;
  addMetric: (metric: PerformanceMetric) => void;
  getCategoryAverage: (category: string) => number;
  getImprovementRate: () => number;
  clearMetrics: () => void;
}

export const usePerformanceAnalytics = (): UsePerformanceAnalyticsReturn => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  const addMetric = useCallback((metric: PerformanceMetric) => {
    setMetrics((prev) => [...prev, metric]);
  }, []);

  const trend = useMemo(() => {
    if (metrics.length === 0) {
      return {
        averageRating: 0,
        highestRating: 0,
        lowestRating: 0,
        totalQuestions: 0,
        categoryBreakdown: {},
        timeline: [],
      };
    }

    const ratings = metrics.map((m) => m.rating);
    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const highestRating = Math.max(...ratings);
    const lowestRating = Math.min(...ratings);

    const categoryBreakdown: Record<string, number> = {};
    metrics.forEach((metric) => {
      if (!categoryBreakdown[metric.category]) {
        categoryBreakdown[metric.category] = 0;
      }
      const categoryMetrics = metrics.filter(
        (m) => m.category === metric.category,
      );
      categoryBreakdown[metric.category] =
        categoryMetrics.reduce((a, b) => a + b.rating, 0) / categoryMetrics.length;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      highestRating,
      lowestRating,
      totalQuestions: metrics.length,
      categoryBreakdown,
      timeline: metrics,
    };
  }, [metrics]);

  const getCategoryAverage = useCallback(
    (category: string) => {
      const categoryMetrics = metrics.filter((m) => m.category === category);
      if (categoryMetrics.length === 0) return 0;
      const sum = categoryMetrics.reduce((a, b) => a + b.rating, 0);
      return Math.round((sum / categoryMetrics.length) * 10) / 10;
    },
    [metrics],
  );

  const getImprovementRate = useCallback(() => {
    if (metrics.length < 2) return 0;

    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const firstAvg =
      firstHalf.reduce((a, b) => a + b.rating, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((a, b) => a + b.rating, 0) / secondHalf.length;

    const improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
    return Math.round(improvement * 10) / 10;
  }, [metrics]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  return {
    metrics,
    trend,
    addMetric,
    getCategoryAverage,
    getImprovementRate,
    clearMetrics,
  };
};
