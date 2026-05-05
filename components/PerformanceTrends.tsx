"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, Award, Zap } from "lucide-react";
import { PerformanceTrend } from "@/hooks/usePerformanceAnalytics";

interface PerformanceTrendsProps {
  trend: PerformanceTrend;
  improvementRate: number;
}

export const PerformanceTrends = ({
  trend,
  improvementRate,
}: PerformanceTrendsProps) => {
  const getScoreLevel = (score: number) => {
    if (score >= 8) return "Advanced";
    if (score >= 6) return "Proficient";
    if (score >= 4) return "Developing";
    return "Beginner";
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-blue-600 dark:text-blue-400";
    if (score >= 4) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBgColor = (score: number) => {
    if (score >= 8) return "bg-green-50 dark:bg-green-950";
    if (score >= 6) return "bg-blue-50 dark:bg-blue-950";
    if (score >= 4) return "bg-amber-50 dark:bg-amber-950";
    return "bg-red-50 dark:bg-red-950";
  };

  return (
    <div className="space-y-3">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Average Score */}
        <Card className={`p-3 ${getBgColor(trend.averageRating)}`}>
          <div className="text-xs text-muted-foreground mb-1">Average</div>
          <div
            className={`text-2xl font-bold ${getScoreColor(trend.averageRating)}`}
          >
            {trend.averageRating}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {getScoreLevel(trend.averageRating)}
          </div>
        </Card>

        {/* Improvement Rate */}
        <Card
          className={`p-3 ${improvementRate > 0 ? "bg-green-50 dark:bg-green-950" : "bg-gray-50 dark:bg-gray-900"}`}
        >
          <div className="text-xs text-muted-foreground mb-1">Improvement</div>
          <div
            className={`text-2xl font-bold ${improvementRate > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
          >
            {improvementRate > 0 ? "+" : ""}
            {improvementRate}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {improvementRate > 0 ? "Getting Better!" : "Keep Practicing"}
          </div>
        </Card>

        {/* Highest Score */}
        <Card className="p-3 bg-green-50 dark:bg-green-950">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Award className="size-3" />
            Best
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {trend.highestRating}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Peak Score</div>
        </Card>

        {/* Total Attempts */}
        <Card className="p-3 bg-blue-50 dark:bg-blue-950">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Zap className="size-3" />
            Attempts
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {trend.totalQuestions}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Questions Done
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(trend.categoryBreakdown).length > 0 && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-900">
          <h4 className="text-xs font-semibold text-foreground uppercase mb-3 tracking-wide">
            Performance by Category
          </h4>
          <div className="space-y-2">
            {Object.entries(trend.categoryBreakdown).map(
              ([category, score]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-foreground capitalize">
                    {category.replace(/[-_]/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          score >= 8
                            ? "bg-green-500"
                            : score >= 6
                              ? "bg-blue-500"
                              : score >= 4
                                ? "bg-amber-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${(score / 10) * 100}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold w-8 text-right ${getScoreColor(score)}`}
                    >
                      {score}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </Card>
      )}

      {/* Quick Insights */}
      <Card className="p-3 bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-2">
          <TrendingUp className="size-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
          <div className="text-sm text-indigo-900 dark:text-indigo-100">
            <p className="font-semibold mb-1">Quick Insight</p>
            <p>
              {improvementRate > 0
                ? `You're improving! Keep up the consistent practice.`
                : trend.averageRating >= 7
                  ? `You're performing well. Focus on the challenging questions.`
                  : `Regular practice will help you improve faster.`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
