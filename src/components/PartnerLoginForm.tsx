"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PartnerLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result: { error?: string } = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to sign in.");
        setIsSubmitting(false);
        return;
      }

      router.replace("/partner");
    } catch (error) {
      console.error("Partner sign-in request failed.", error);
      setError("Unable to sign in. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="mt-2 w-full border border-line bg-background px-3 py-2 text-foreground outline-none focus:border-accent"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
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
      {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
    </form>
  );
}
