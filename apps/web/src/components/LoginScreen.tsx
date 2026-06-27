import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginScreenProps {
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (payload: { username: string; password: string }) => void;
}

export const LoginScreen = ({ error, isSubmitting, onSubmit }: LoginScreenProps) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      return;
    }

    onSubmit({ username: username.trim(), password });
  };

  return (
    <main className="flex h-[100dvh] items-center justify-center bg-gradient-to-tr from-emerald-50/70 via-[#f6faf7] to-[#ebf3ee] px-4 py-8 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(98,127,88,0.06),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(98,127,88,0.04),transparent_55%)] pointer-events-none" />
      
      <section className="relative w-full max-w-[400px] rounded-2xl border border-[#627f58]/12 bg-white/95 p-8 shadow-[0_20px_50px_rgba(98,127,88,0.08)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_24px_60px_rgba(98,127,88,0.12)]">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-[#627f58] text-white shadow-[0_8px_16px_-4px_rgba(98,127,88,0.35)]">
            <LockKeyhole className="h-5.5 w-5.5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900">登录 EdgeEver</h1>
            <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">自托管笔记工作区</p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">账号</span>
            <input
              autoComplete="username"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm outline-none transition-all duration-200 focus:border-[#627f58] focus:bg-white focus:ring-4 focus:ring-[#627f58]/10"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">密码</span>
            <input
              autoComplete="current-password"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 text-sm outline-none transition-all duration-200 focus:border-[#627f58] focus:bg-white focus:ring-4 focus:ring-[#627f58]/10"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <div className="rounded-lg border border-rose-100 bg-rose-50/80 px-3.5 py-2.5 text-xs font-medium text-rose-700 transition duration-150 animate-shake">
              {error}
            </div>
          )}

          <Button 
            className="w-full h-11 justify-center rounded-lg bg-[#627f58] hover:bg-[#526d49] text-white font-semibold transition-all duration-200 shadow-[0_8px_20px_-4px_rgba(98,127,88,0.25)] hover:shadow-[0_12px_24px_-4px_rgba(98,127,88,0.35)]" 
            size="md" 
            type="submit" 
            variant="solid" 
            disabled={isSubmitting}
          >
            <LockKeyhole className="h-4 w-4 mr-1" />
            {isSubmitting ? "安全登录中..." : "开启工作区"}
          </Button>
        </form>
      </section>
    </main>
  );
};
