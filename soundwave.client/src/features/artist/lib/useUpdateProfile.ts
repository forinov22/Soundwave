import { useState } from "react";

import { artistApi, type ArtistProfile } from "../api/artistApi";

export function useUpdateProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (payload: {
    name?: string;
    description?: string;
    avatar?: File;
    banner?: File;
  }): Promise<ArtistProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await artistApi.updateProfile(payload);
      return res.data;
    } catch {
      setError("Не удалось обновить профиль");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, isLoading, error };
}
