import type { ReleaseDetails, ReleaseType } from "@/shared/types/Release";

// Публичный профиль артиста — соответствует ArtistDetailsDto
export interface ArtistPublicProfile {
  id: number;
  name: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  monthlyListeners: number;
}

// Фильтр для дискографии — null = все
export type DiscographyFilter = ReleaseType | null;

export type DiscographySortField = "date" | "name";
export type DiscographySortDir = "asc" | "desc";
