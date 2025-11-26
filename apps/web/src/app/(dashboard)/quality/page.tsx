'use client';

/**
 * Organization Quality Dashboard Page
 * Shows organization-wide meeting quality metrics and trends
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';
import TeamQualityDashboard from '@/components/quality/TeamQualityDashboard';

type Period = 'week' | 'month' | 'quarter';

export default function QualityDashboardPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load trends
      const trendsRes = await fetch(`/api/quality/trends?period=${period}`);
      if (!trendsRes.ok) throw new Error('Failed to load trends');
      const trendsData = await trendsRes.json();
      setTrends(trendsData.trends);

      // Load benchmarks
      const benchmarksRes = await fetch('/api/quality/benchmarks');
      if (benchmarksRes.ok) {
        const benchmarksData = await benchmarksRes.json();
        setBenchmarks(benchmarksData.benchmarks);
      }

      // Load recommendations
      const recsRes = await fetch('/api/quality/recommendations');
      if (recsRes.ok) {
        const recsData = await recsRes.json();
        setRecommendations(recsData.recommendations || []);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load quality data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
            <div className="h-96 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Data</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting Quality Dashboard</h1>
              <p className="text-gray-600">Track and improve meeting effectiveness across your organization</p>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
            {(['week', 'month', 'quarter'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Benchmarks Card */}
        {benchmarks && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Industry Benchmarks</h2>
                <p className="text-blue-100 mb-4">{benchmarks.comparisonText}</p>
                <div className="flex items-baseline space-x-4">
                  <div>
                    <div className="text-sm opacity-75">Your Score</div>
                    <div className="text-3xl font-bold">{trends?.averageScore.toFixed(1)}</div>
                  </div>
                  <div className="text-2xl opacity-50">vs</div>
                  <div>
                    <div className="text-sm opacity-75">Industry Average</div>
                    <div className="text-3xl font-bold">{benchmarks.averageScore}</div>
                  </div>
                  <div className="ml-auto">
                    <div className="text-sm opacity-75">Percentile</div>
                    <div className="text-3xl font-bold">{benchmarks.percentile}th</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard */}
        {trends && (
          <TeamQualityDashboard
            trends={trends}
            period={period}
          />
        )}

        {/* Personalized Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Personalized Improvement Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border-2 p-4 ${
                    rec.priority === 'high'
                      ? 'border-red-300 bg-red-50'
                      : rec.priority === 'medium'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-green-300 bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      rec.priority === 'high'
                        ? 'bg-red-200 text-red-800'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                    <span className="text-xs text-gray-500">{rec.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <div className="bg-white bg-opacity-50 rounded p-2 mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      💡 {rec.suggestion}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Impact: <span className="font-semibold capitalize">{rec.impact}</span>
                    </span>
                    <span className="text-gray-600">
                      Effort: <span className="font-semibold capitalize">{rec.effort}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Review Top Meetings</div>
                <div className="text-sm text-gray-600">Learn from best practices</div>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Schedule Check-in</div>
                <div className="text-sm text-gray-600">Discuss improvements with team</div>
              </div>
            </button>

            <button className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all">
              <Filter className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">Filter by Team</div>
                <div className="text-sm text-gray-600">Drill down into specifics</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
