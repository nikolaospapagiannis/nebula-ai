'use client';

import { useState, useEffect } from 'react';
import { PipelineFunnel } from '@/components/revenue/PipelineFunnel';
import { DealTable } from '@/components/revenue/DealTable';
import { WinLossChart } from '@/components/revenue/WinLossChart';
import { DealDetailPanel } from '@/components/revenue/DealDetailPanel';
import { RevenueKPICards } from '@/components/revenue/RevenueKPICards';

export default function RevenueDashboard() {
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [dealsData, setDealsData] = useState<any[]>([]);
  const [winLossData, setWinLossData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all revenue data on mount
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get auth token from localStorage or session
        const token = localStorage.getItem('authToken') || '';

        // Fetch pipeline metrics
        const pipelineResponse = await fetch('/api/revenue/pipeline', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!pipelineResponse.ok) {
          throw new Error(`Pipeline fetch failed: ${pipelineResponse.status}`);
        }

        const pipelineResult = await pipelineResponse.json();
        setPipelineData(pipelineResult.data || pipelineResult);

        // Fetch deals list
        const dealsResponse = await fetch('/api/revenue/deals', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!dealsResponse.ok) {
          throw new Error(`Deals fetch failed: ${dealsResponse.status}`);
        }

        const dealsResult = await dealsResponse.json();
        setDealsData(dealsResult.data || dealsResult);

        // Fetch win-loss analysis
        const winLossResponse = await fetch('/api/revenue/win-loss-analysis', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!winLossResponse.ok) {
          throw new Error(`Win-loss fetch failed: ${winLossResponse.status}`);
        }

        const winLossResult = await winLossResponse.json();
        setWinLossData(winLossResult.data || winLossResult);

      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load revenue data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  // Handle deal selection
  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId === selectedDealId ? null : dealId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading revenue intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-red-400 mb-2">Failed to load revenue data</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Revenue Intelligence</h1>
          <p className="text-gray-400">Real-time pipeline insights and deal analytics</p>
        </div>

        {/* KPI Cards */}
        <RevenueKPICards
          pipelineData={pipelineData}
          winLossData={winLossData}
          dealsData={dealsData}
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Funnel */}
          <div className="bg-[var(--ff-bg-layer)] border border-[var(--ff-border)] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Pipeline Overview</h2>
            <PipelineFunnel data={pipelineData} />
          </div>

          {/* Win/Loss Analysis */}
          <div className="bg-[var(--ff-bg-layer)] border border-[var(--ff-border)] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Win/Loss Analysis</h2>
            <WinLossChart data={winLossData} />
          </div>
        </div>

        {/* Deals Table and Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[var(--ff-bg-layer)] border border-[var(--ff-border)] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Active Deals</h2>
              <DealTable
                deals={dealsData}
                onDealSelect={handleDealSelect}
                selectedDealId={selectedDealId}
              />
            </div>
          </div>

          {/* Deal Detail Panel */}
          {selectedDealId && (
            <div className="lg:col-span-1">
              <DealDetailPanel dealId={selectedDealId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}