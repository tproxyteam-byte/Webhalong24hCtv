"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Send username under both keys to ensure maximum compatibility with the API
          username: username.trim(),
          email: username.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const role = Number(result.data?.user?.role ?? result.data?.role);

        if (role !== 2) {
          toast.error("Không có tài khoản.");
          return;
        }

        toast.success("Đăng nhập thành công!");

        // Authentication tokens are set as HttpOnly cookies by the Route Handler.
        const maxAge = 365 * 24 * 60 * 60; // 365 days
        document.cookie = `username=${encodeURIComponent(username.trim())}; path=/; max-age=${maxAge}; SameSite=Lax`;

        // Redirect to homepage with a full page reload to reset client-side router states
        window.location.href = "/";
      } else {
        toast.error(result.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      {/* Premium Background Blurs */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] translate-x-1/2 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none" />

      {/* Glassmorphic Login Container */}
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1 shadow-md">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
              Webhalong24h
            </span>
            <span className="h-3 w-px bg-white/30" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-100">
              Sale
            </span>
          </div>
          <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
            Đăng nhập hệ thống
          </h2>
          <p className="mt-1.5 text-center text-xs text-neutral-400">
            Dành riêng cho Sale và CTV Webhalong24h
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider"
              >
                Tài khoản hoặc Email
              </label>
              <div className="mt-1.5">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-white placeholder-neutral-500 shadow-inner outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider"
              >
                Mật khẩu
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-sm text-white placeholder-neutral-500 shadow-inner outline-none transition-all focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  {showPassword ? (
                    // Eye Off Icon
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Eye Icon
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-teal-600 hover:to-teal-700 hover:shadow-lg hover:shadow-teal-500/10 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xử lý...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
