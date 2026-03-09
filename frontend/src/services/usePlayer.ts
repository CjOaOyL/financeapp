import { useEffect, useState, useCallback } from 'react';
import Api from './api';

export interface PlayerSummary {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  topicMastery: Record<string, any>;
  badges: any[];
  streakData: any;
  skillTree: any;
  statistics: any;
}

export interface PlayerContext {
  player: PlayerSummary | null;
  unlockedRegions: string[];
  loading: boolean;
  refresh: () => void;
  solve: (result: any) => Promise<any>;
  defeatBoss: (bossId: string) => Promise<void>;
}

const DEFAULT_PLAYER_ID = 'player-1';

export function usePlayer(playerId = DEFAULT_PLAYER_ID): PlayerContext {
  const [player, setPlayer] = useState<PlayerSummary | null>(null);
  const [unlockedRegions, setUnlockedRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    Api.get(`/player/${playerId}`)
      .then(r => {
        setPlayer(r.data.player ?? null);
        setUnlockedRegions(r.data.unlockedRegions ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [playerId]);

  useEffect(() => { refresh(); }, [refresh]);

  const solve = useCallback(async (result: any) => {
    const r = await Api.post(`/player/${playerId}/solve`, result);
    setPlayer(r.data.player ?? null);
    return r.data;
  }, [playerId]);

  const defeatBossApi = useCallback(async (bossId: string) => {
    const r = await Api.post(`/player/${playerId}/boss-defeat`, { bossId });
    setPlayer(r.data.player ?? null);
    setUnlockedRegions(r.data.unlockedRegions ?? []);
  }, [playerId]);

  return { player, unlockedRegions, loading, refresh, solve, defeatBoss: defeatBossApi };
}
