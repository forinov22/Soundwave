import type { Release } from "@/shared/types/Release";

export interface ArtistSummary {
  id: number;
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  monthlyListeners: number;
}

export type { Release };
