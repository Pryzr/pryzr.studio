"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (!response.ok) {
      const result: { error?: string } = await response.json();
      setError(result.error ?? "Unable to sign in.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="username">
          Username
        </label>
        <input
          className="mt-2 w-full border border-line bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
          id="username"
          name="username"
          required
          type="text"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <input
          className="mt-2 w-full border border-line bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      <button
        className="w-full rounded-sm bg-accent px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </form>
  );
}
