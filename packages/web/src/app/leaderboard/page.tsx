'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCompetitiveStore } from '@/store/useCompetitiveStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  ArrowLeft,
  Medal,
  Award,
  Crown,
  Zap,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

interface LeaderboardEntry {
  rank: number;
  id: string;
  email: string;
  trophies: number;
  avgWpm: number;
  totalTests: number;
}

export default function LeaderboardPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const localTrophies = useCompetitiveStore((state) => state.trophies);
  const validateAndSyncTrophies = useCompetitiveStore(
    (state) => state.validateAndSyncTrophies
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncAndFetch = async () => {
      try {
        // First fetch leaderboard
        await fetchLeaderboard();

        // Then validate and sync trophies if user is authenticated
        if (user && token) {
          console.log('[Leaderboard] Validating trophy consistency...');
          await validateAndSyncTrophies();
          // Refresh leaderboard after validation/sync completes
          console.log(
            '[Leaderboard] Trophy validation complete, refreshing leaderboard...'
          );
          await fetchLeaderboard();
        }
      } catch (error) {
        console.error('[Leaderboard] Error during sync and fetch:', error);
      }
    };

    syncAndFetch();
  }, [user, token, validateAndSyncTrophies]); // Include all dependencies

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/leaderboard');
      setLeaderboard(response.leaderboard || []);
      setCurrentUserRank(response.currentUserRank);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trophy Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Top players ranked by trophies
          </p>
        </div>
        <Link href="/compete">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Compete
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <p className="text-destructive text-center">{error}</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={fetchLeaderboard} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && leaderboard.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Players Yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to compete and claim the top spot!
            </p>
            <Link href="/compete">
              <Button className="gap-2">Start Competing</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Current User Position Card */}
      {!loading && !error && currentUserRank && currentUserRank > 10 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">#{currentUserRank}</div>
                <div>
                  <p className="font-semibold">Your Position</p>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Trophy className="h-4 w-4" />
                    <span>{localTrophies} trophies</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  {currentUserRank > 25
                    ? `${26 - currentUserRank} places`
                    : `${11 - currentUserRank} places`}{' '}
                  to
                </p>
                <p className="text-sm font-medium">
                  {currentUserRank > 25 ? 'Top 25' : 'Top 10'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      {!loading && !error && leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 50 Players</CardTitle>
            <CardDescription>
              Compete in races to earn trophies and climb the ranks
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Rank</th>
                    <th className="p-4 text-left font-medium">Player</th>
                    <th className="p-4 text-right font-medium">Trophies</th>
                    <th className="hidden p-4 text-right font-medium sm:table-cell">
                      Avg WPM
                    </th>
                    <th className="hidden p-4 text-right font-medium lg:table-cell">
                      Total Tests
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player) => (
                    <tr
                      key={player.rank}
                      className={cn(
                        'border-b transition-colors',
                        user &&
                          player.id === user.id &&
                          'bg-primary/10 font-semibold',
                        (!user || player.id !== user.id) && 'hover:bg-muted/50'
                      )}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(player.rank)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {player.email}
                          {user && player.id === user.id && (
                            <span className="bg-primary text-primary-foreground rounded px-2 py-0.5 text-xs">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Trophy className="text-muted-foreground h-4 w-4" />
                          <span
                            className={cn(
                              player.rank <= 3 && 'text-lg font-bold'
                            )}
                          >
                            {player.trophies.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="hidden p-4 text-right sm:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <Zap className="text-muted-foreground h-4 w-4" />
                          <span className="text-muted-foreground">
                            {player.avgWpm} WPM
                          </span>
                        </div>
                      </td>
                      <td className="hidden p-4 text-right lg:table-cell">
                        <div className="flex items-center justify-end gap-2">
                          <BarChart3 className="text-muted-foreground h-4 w-4" />
                          <span className="text-muted-foreground">
                            {player.totalTests.toLocaleString()} tests
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trophy Rewards Info */}
      {!loading && !error && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-success h-2 w-2 rounded-full" />
                <span>Win: +25 trophies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-destructive h-2 w-2 rounded-full" />
                <span>Loss: -15 trophies</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
