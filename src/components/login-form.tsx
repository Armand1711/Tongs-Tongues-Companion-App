"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.string().trim().email("Enter a valid email address.");

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.issues[0].message);
      return;
    }
    if (!password) {
      toast.error("Enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: emailResult.data,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      router.push("/account");
      router.refresh();
    } catch {
      toast.error("Couldn't log you in — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="btn-sticker h-14 rounded-2xl bg-primary text-base font-heading uppercase tracking-wide text-primary-foreground"
      >
        {submitting && <Loader2 className="size-5 animate-spin" />}
        {submitting ? "Logging in..." : "Log In"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>

      <p className="rounded-xl bg-muted px-3 py-2.5 text-center text-[11px] text-muted-foreground">
        Heads up: logging in switches to that account. Any coasters or
        entries collected as a guest on this device stay with the guest
        session — sign up instead if you want to keep them.
      </p>
    </form>
  );
}
