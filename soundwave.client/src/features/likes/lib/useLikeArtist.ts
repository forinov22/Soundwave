import { useCallback } from "react";
import { likesApi } from "../api/likesApi";
import { useLikesStore } from "../model/likesStore";

export function useLikeArtist() {
  const store = useLikesStore();

  const toggleFollowArtist = useCallback(
    async (artistId: number) => {
      const wasFollowed = store.isArtistFollowed(artistId);

      useLikesStore.setState((s) => {
        const ids = new Set(s.followedArtistIds);
        wasFollowed ? ids.delete(artistId) : ids.add(artistId);
        return { followedArtistIds: ids };
      });

      try {
        const res = await likesApi.toggleFollowArtist(artistId);
        if (res.data.followed) {
          likesApi.getFollowedArtists().then((r) => store.setFollowedArtists(r.data));
        } else {
          store.removeFollowedArtist(artistId);
        }
      } catch {
        useLikesStore.setState((s) => {
          const ids = new Set(s.followedArtistIds);
          wasFollowed ? ids.add(artistId) : ids.delete(artistId);
          return { followedArtistIds: ids };
        });
      }
    },
    [store],
  );

  return {
    isArtistFollowed: (id: number) => store.isArtistFollowed(id),
    toggleFollowArtist,
  };
}
