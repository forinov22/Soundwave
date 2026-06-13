import { useCallback } from "react";
import { useNavigate } from "react-router";

import { useAsync } from "@/shared/hooks/useAsync";
import { searchApi } from "../api/searchApi";
import { useSearchStore } from "../model/searchStore";

export function useRecognize() {
  const setRecognizeResult = useSearchStore((s) => s.setRecognizeResult);
  const navigate = useNavigate();

  const { execute, isLoading: isRecognizing } = useAsync(async (file: File) => {
    const res = await searchApi.recognize(file);
    setRecognizeResult(res.data);
    return res.data;
  });

  const recognize = useCallback(
    async (file: File) => {
      navigate("/search");
      try {
        await execute(file);
      } catch {
        setRecognizeResult({
          confident: false,
          bestMatch: null,
          candidates: [],
        });
      }
    },
    [execute, navigate, setRecognizeResult],
  );

  return { recognize, isRecognizing };
}
