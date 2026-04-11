import { useEffect } from "react";
import {Loader2} from "lucide-react";

import { useAuth } from "@/features/auth/lib/useAuth";

export default function AuthCallbackPage() {
  const { handleAuthSuccess } = useAuth();

  useEffect(() => {
    handleAuthSuccess();
  }, [handleAuthSuccess]);

  return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p>Авторизация...</p>
        </div>
      </div>
  );
}
