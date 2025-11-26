'use client';

import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Settings, Download } from 'lucide-react';
import TopicTable, { Topic } from '@/components/topics/TopicTable';
import TrendChart from '@/components/topics/TrendChart';
import MentionList from '@/components/topics/MentionList';
import AlertConfig from '@/components/topics/AlertConfig';
import TopicCorrelation from '@/components/topics/TopicCorrelation';
import AddTopicModal from '@/components/topics/AddTopicModal';
import apiClient from '@/lib/api';

export default function TopicsPage() {
  // State Management
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trends' | 'mentions' | 'alerts' | 'correlations'>('trends');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date; end: Date } | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getTopics({ limit: 100 });

      // Transform API response to match our Topic interface
      const transformedTopics: Topic[] = response.topics.map((topic: any) => ({
        id: topic.id,
        keyword: topic.keyword,
        name: topic.name || topic.keyword,
        mentionCount: topic.totalMentions || 0,
        trend: topic.trend || 'stable',
        trendPercent: topic.changePercent || 0,
        lastMentioned: topic.lastMentioned ? new Date(topic.lastMentioned) : undefined,
        isActive: topic.isActive !== false,
        alertEnabled: topic.alertEnabled || false,
        alertThreshold: topic.alertThreshold
      }));

      setTopics(transformedTopics);

      // Auto-select first topic if none selected
      if (transformedTopics.length > 0 && !selectedTopic) {
        setSelectedTopic(transformedTopics[0]);
        setSelectedTopicIds([transformedTopics[0].id]);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);

    // Toggle selection for trend comparison
    if (selectedTopicIds.includes(topic.id)) {
      setSelectedTopicIds(prev => prev.filter(id => id !== topic.id));
    } else {
      setSelectedTopicIds(prev => [...prev, topic.id].slice(-5)); // Max 5 topics
    }
  };

  const handleTopicDelete = (id: string) => {
    setTopics(prev => prev.filter(topic => topic.id !== id));
    if (selectedTopic?.id === id) {
      setSelectedTopic(null);
    }
    setSelectedTopicIds(prev => prev.filter(topicId => topicId !== id));
  };

  const handleAddTopic = (newTopic: any) => {
    const transformedTopic: Topic = {
      id: newTopic.id,
      keyword: newTopic.keyword,
      name: newTopic.name || newTopic.keyword,
      mentionCount: 0,
      trend: 'stable',
      trendPercent: 0,
      lastMentioned: undefined,
      isActive: true,
      alertEnabled: newTopic.alertEnabled || false,
      alertThreshold: newTopic.alertThreshold
    };

    setTopics(prev => [transformedTopic, ...prev]);
    setSelectedTopic(transformedTopic);
    setSelectedTopicIds([transformedTopic.id]);
  };

  const handleAlertConfigSave = async (configs: any[]) => {
    // Update alert configuration in backend
    if (selectedTopic) {
      try {
        for (const config of configs) {
          await apiClient.configureTopicAlert(selectedTopic.id, config);
        }
        // Refresh topics to get updated alert status
        fetchTopics();
      } catch (error) {
        console.error('Error saving alert configuration:', error);
      }
    }
  };

  const handleMeetingClick = (meetingId: string) => {
    // Navigate to meeting detail page
    window.location.href = `/dashboard/meetings/${meetingId}`;
  };

  const handleCorrelationTopicClick = (topicId: string, topicName: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
      setActiveTab('trends');
    }
  };

  const exportData = async () => {
    try {
      const data = {
        topics: topics,
        exportDate: new Date().toISOString(),
        selectedPeriod: period
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `topic-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const topicNamesMap = new Map(
    topics.map(t => [t.id, t.name || t.keyword])
  );

  return (
    <div className="min-h-screen bg-[var(--ff-bg-dark)]">
      {/* Page Header */}
      <div className="border-b border-[var(--ff-border)] bg-[var(--ff-bg-layer)]">
        <div className="container-ff py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-l text-white">Topic Tracker</h1>
              <p className="text-gray-400 mt-2">
                Monitor keywords and topics across all your meetings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTopics}
                className="button-secondary flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button
                onClick={exportData}
                className="button-secondary flex items-center gap-2"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="button-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Add Topic
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-ff py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Topic List */}
          <div className="lg:col-span-5">
            <TopicTable
              topics={topics}
              onTopicSelect={handleTopicSelect}
              onTopicDelete={handleTopicDelete}
              onRefresh={fetchTopics}
              loading={loading}
            />

            {/* Quick Stats */}
            {topics.length > 0 && (
              <div className="card-ff mt-6">
                <h3 className="font-medium text-white mb-4">Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {topics.length}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Tracked Topics</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {topics.reduce((sum, t) => sum + t.mentionCount, 0)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Total Mentions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {topics.filter(t => t.alertEnabled).length}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Active Alerts</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-7">
            {selectedTopic ? (
              <>
                {/* Tab Navigation */}
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg mb-6 inline-flex">
                  {(['trends', 'mentions', 'alerts', 'correlations'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded capitalize transition-colors ${
                        activeTab === tab
                          ? 'bg-[var(--ff-purple-500)] text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'trends' && (
                  <TrendChart
                    topicIds={selectedTopicIds}
                    topicNames={topicNamesMap}
                    period={period}
                    customDateRange={customDateRange}
                    onPeriodChange={setPeriod}
                    height={400}
                  />
                )}

                {activeTab === 'mentions' && (
                  <MentionList
                    topicId={selectedTopic.id}
                    topicName={selectedTopic.name || selectedTopic.keyword}
                    onMeetingClick={handleMeetingClick}
                  />
                )}

                {activeTab === 'alerts' && (
                  <AlertConfig
                    topicId={selectedTopic.id}
                    topicName={selectedTopic.name || selectedTopic.keyword}
                    onSave={handleAlertConfigSave}
                  />
                )}

                {activeTab === 'correlations' && (
                  <TopicCorrelation
                    topicId={selectedTopic.id}
                    topicName={selectedTopic.name || selectedTopic.keyword}
                    onTopicClick={handleCorrelationTopicClick}
                  />
                )}
              </>
            ) : (
              <div className="card-ff h-96 flex items-center justify-center">
                <div className="text-center">
                  <Settings className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-400">
                    {topics.length === 0
                      ? 'Add your first topic to get started'
                      : 'Select a topic to view details'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTopic}
      />
    </div>
  );
}