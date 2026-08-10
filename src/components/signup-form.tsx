"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createClient, ensureUser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.string().trim().email("Enter a valid email address.");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.");

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.issues[0].message);
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.issues[0].message);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      await ensureUser(supabase);

      const { error } = await supabase.auth.updateUser(
        {
          email: emailResult.data,
          password: passwordResult.data,
        },
        { emailRedirectTo: `${window.location.origin}/auth/confirm` }
      );
      if (error) {
        toast.error(error.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email === emailResult.data) {
        toast.success("Account created!");
      } else {
        toast.success("Almost there — check your inbox to confirm your email.");
      }

      router.push("/account");
      router.refresh();
    } catch {
      toast.error("Couldn't create your account — try again.");
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Retype your password"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="h-14 rounded-[20px] border-0 text-base font-heading uppercase tracking-wide"
        style={{
          background:
            "linear-gradient(135deg, var(--weber-ember-start), var(--weber-ember-end))",
        }}
      >
        {submitting && <Loader2 className="size-5 animate-spin" />}
        {submitting ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </form>
  );
}
