"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import apiClient from "@/lib/api-client";
import { 
  StarIcon, 
  TrophyIcon, 
  UserGroupIcon, 
  ArrowTrendingUpIcon,
  SparklesIcon,
  GiftIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface PointsData {
  totalPoints: number;
  pointBreakdown: {
    invitePoints: number;
    tradePoints: number;
    referralBonusPoints: number;
  };
  lastUpdated: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  name: string;
  totalPoints: number;
}

interface HistoryEntry {
  transactionId: string;
  pointType: string;
  points: number;
  description: string;
  earnedAt: string;
}

export default function RewardsPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard" | "history">("overview");

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('🔄 Fetching rewards data with apiClient...');
      fetchRewardsData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const fetchRewardsData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📍 Step 1: Fetching my points...');
      // Use apiClient method instead of raw fetch
      const pointsResult = await apiClient.getMyRewardPoints();
      
      if (pointsResult.success && pointsResult.data) {
        console.log('✅ Points data:', pointsResult.data);
        setPointsData({
          totalPoints: pointsResult.data.totalPoints,
          pointBreakdown: pointsResult.data.pointBreakdown,
          lastUpdated: pointsResult.data.lastUpdated
        });
      } else {
        console.warn('⚠️ Points API error:', pointsResult.error);
        // Set default empty data on error
        setPointsData({
          totalPoints: 0,
          pointBreakdown: {
            invitePoints: 0,
            tradePoints: 0,
            referralBonusPoints: 0
          },
          lastUpdated: new Date().toISOString()
        });
      }

      console.log('📍 Step 2: Fetching leaderboard...');
      // Get leaderboard (public endpoint)
      const leaderboardResult = await apiClient.getRewardLeaderboard({ limit: 20 });
      
      if (leaderboardResult.success && leaderboardResult.data) {
        console.log('✅ Leaderboard data:', leaderboardResult.data);
        setLeaderboard(leaderboardResult.data.leaderboard || []);
      } else {
        console.warn('⚠️ Leaderboard API error:', leaderboardResult.error);
        setLeaderboard([]);
      }

      console.log('📍 Step 3: Fetching history...');
      // Get my reward history
      const historyResult = await apiClient.getMyRewardHistory({ limit: 10 });
      
      if (historyResult.success && historyResult.data?.data) {
        console.log('✅ History data:', historyResult.data.data);
        // Map the data to match our interface
        const mappedHistory: HistoryEntry[] = historyResult.data.data.map((item: {
          transactionId: string;
          pointType: 'invite' | 'trade' | 'referral_bonus';
          points: number;
          description: string;
          earnedAt: string;
        }) => ({
          transactionId: item.transactionId,
          pointType: item.pointType,
          points: item.points,
          description: item.description,
          earnedAt: item.earnedAt
        }));
        setHistory(mappedHistory);
      } else {
        console.warn('⚠️ History API error:', historyResult.error);
        setHistory([]);
      }

      console.log('✅ All rewards data fetched successfully');
      setLoading(false);

    } catch (err: any) {
      console.error('❌ Error fetching rewards data:', err);
      
      const errorMessage = err.message || 'Failed to load rewards data';
      setError(errorMessage);
      setLoading(false);
      
      // Set default empty data
      setPointsData({
        totalPoints: 0,
        pointBreakdown: {
          invitePoints: 0,
          tradePoints: 0,
          referralBonusPoints: 0
        },
        lastUpdated: new Date().toISOString()
      });
      setLeaderboard([]);
      setHistory([]);
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retrying rewards data fetch...');
    fetchRewardsData();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D364DB] border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please log in to view your rewards</p>
        </div>
      </div>
    );
  }

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case "invite": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
      case "trade": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      case "referral_bonus": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getPointTypeIcon = (type: string) => {
    switch (type) {
      case "invite": return UserGroupIcon;
      case "trade": return ArrowTrendingUpIcon;
      case "referral_bonus": return GiftIcon;
      default: return StarIcon;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EDFF]/50 dark:bg-[#252525] pb-32">
      <div className="w-full max-w-[1080px] mx-auto">
        
        {/* Header */}
        <header className="px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D364DB] to-[#C554CB] flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-slate-900 dark:text-white">Rewards</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Earn points, unlock rewards</p>
            </div>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="mx-6 mb-6 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border-2 border-red-200 dark:border-red-800/50">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 dark:text-red-200 mb-1">Error Loading Rewards</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      console.log('📋 Checking auth state...');
                      console.log('Token:', apiClient.getToken());
                      console.log('User:', user);
                    }}
                    className="text-sm font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                  >
                    Debug
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mx-6 mb-6 bg-white dark:bg-[#3D3D3D] rounded-2xl p-8 text-center border-2 border-slate-200 dark:border-[#A3A3A3]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D364DB] border-t-transparent mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading your rewards...</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">This may take a few seconds</p>
            <p className="text-xs text-slate-400 dark:text-slate-600 mt-3">
              Check your browser console (F12) for detailed logs
            </p>
          </div>
        )}

        {/* Coming Soon Banner */}
        {!loading && (
          <>
            <div className="mx-6 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-3">
                <SparklesIcon className="w-6 h-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Rewards Coming Soon! 🎁</h3>
                  <p className="text-sm opacity-90">
                    Your points are being tracked. Soon you'll be able to redeem them for exclusive rewards, cashback, and special perks!
                  </p>
                </div>
              </div>
            </div>

            {/* Points Card */}
            <div className="px-6 mb-6">
              <div className="bg-gradient-to-br from-[#D364DB] to-[#C554CB] rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <StarSolid className="w-6 h-6" />
                    <span className="text-sm font-bold opacity-90">Your Points</span>
                  </div>
                  <ClockIcon className="w-5 h-5 opacity-70" />
                </div>
                
                <div className="mb-6">
                  <p className="text-5xl font-black mb-1">{pointsData?.totalPoints.toLocaleString() || 0}</p>
                  <p className="text-sm opacity-80">Total Points Earned</p>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <UserGroupIcon className="w-5 h-5 mb-1 opacity-80" />
                    <p className="text-2xl font-bold">{pointsData?.pointBreakdown.invitePoints || 0}</p>
                    <p className="text-xs opacity-70">Invites</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <ArrowTrendingUpIcon className="w-5 h-5 mb-1 opacity-80" />
                    <p className="text-2xl font-bold">{pointsData?.pointBreakdown.tradePoints || 0}</p>
                    <p className="text-xs opacity-70">Trades</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <GiftIcon className="w-5 h-5 mb-1 opacity-80" />
                    <p className="text-2xl font-bold">{pointsData?.pointBreakdown.referralBonusPoints || 0}</p>
                    <p className="text-xs opacity-70">Referrals</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Earn Points */}
            <div className="px-6 mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">How to Earn Points</h3>
              <div className="space-y-3">
                <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-4 border-2 border-slate-200 dark:border-[#A3A3A3]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Invite Friends</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Get <span className="font-bold text-[#D364DB]">1 point</span> for each friend you invite
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-500">Unlimited invites</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-4 border-2 border-slate-200 dark:border-[#A3A3A3]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Trade USDC</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Earn <span className="font-bold text-[#D364DB]">0.2 points per $1</span> traded
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-500">$100 = 20 points</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl p-4 border-2 border-slate-200 dark:border-[#A3A3A3]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                      <GiftIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Referral Bonus</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Get <span className="font-bold text-[#D364DB]">50% of points</span> your referrals earn from trading
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-500">Passive earnings!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-4">
              <div className="flex gap-2 bg-white dark:bg-[#3D3D3D] rounded-2xl p-2 border-2 border-slate-200 dark:border-[#A3A3A3]">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                    activeTab === "overview"
                      ? "bg-[#D364DB] text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                    activeTab === "leaderboard"
                      ? "bg-[#D364DB] text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                    activeTab === "history"
                      ? "bg-[#D364DB] text-white"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  History
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="px-6">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800/50">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-[#D364DB]" />
                      Your Rank
                    </h4>
                    <p className="text-3xl font-black text-[#D364DB] mb-1">
                      #{leaderboard.findIndex(entry => entry.username === user?.username) + 1 || "—"}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Out of {leaderboard.length} users
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "leaderboard" && (
                <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl border-2 border-slate-200 dark:border-[#A3A3A3] overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrophyIcon className="w-5 h-5 text-[#D364DB]" />
                      Top Earners
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {leaderboard.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        No leaderboard data yet
                      </div>
                    ) : (
                      leaderboard.slice(0, 10).map((entry) => (
                        <div key={entry.rank} className="p-4 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            entry.rank === 1 ? "bg-yellow-100 text-yellow-600" :
                            entry.rank === 2 ? "bg-gray-100 text-gray-600" :
                            entry.rank === 3 ? "bg-orange-100 text-orange-600" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {entry.rank}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 dark:text-white">@{entry.username}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{entry.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#D364DB]">{entry.totalPoints.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">points</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="bg-white dark:bg-[#3D3D3D] rounded-2xl border-2 border-slate-200 dark:border-[#A3A3A3] overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                  </div>
                  {history.length === 0 ? (
                    <div className="p-8 text-center">
                      <StarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No points earned yet</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Start trading or inviting friends!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                      {history.map((entry) => {
                        const Icon = getPointTypeIcon(entry.pointType);
                        return (
                          <div key={entry.transactionId} className="p-4 flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getPointTypeColor(entry.pointType)}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-sm">
                                +{entry.points} points
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                {entry.description}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                {new Date(entry.earnedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}