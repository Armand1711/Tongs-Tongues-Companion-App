"use client";

import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { CameraOff, RotateCcw } from "lucide-react";
import { createClient, ensureUser } from "@/lib/supabase/client";
import { collectCard, getCardById } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { COASTER_STYLES } from "@/lib/coasters";
import { emberBurst } from "@/components/ember-field";
import type { ItemSlug } from "@/lib/constants";
import type { Card as CardData } from "@/lib/database.types";

type ScanState =
  | { status: "scanning" }
  | { status: "starting" }
  | { status: "camera_error" }
  | { status: "result"; card: CardData; alreadyCollected: boolean };

export function QrScanner() {
  const elementId = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [state, setState] = useState<ScanState>({ status: "starting" });

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled || !containerRef.current) return;

      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => handleDecoded(decodedText),
          undefined
        );
        if (!cancelled) setState({ status: "scanning" });
      } catch {
        if (!cancelled) setState({ status: "camera_error" });
      }
    }

    start();

    return () => {
      cancelled = true;
      scannerRef.current?.stop().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementId]);

  async function handleDecoded(decodedText: string) {
    const scanner = scannerRef.current;
    if (!scanner) return;

    // Ignore further reads until this one resolves and the user chooses
    // to scan again — a raw video feed fires onScanSuccess many times/sec.
    try {
      await scanner.pause(true);
    } catch {
      // already paused/stopped
    }

    const code = decodedText.trim().toUpperCase();
    const supabase = createClient();
    const user = await ensureUser(supabase);

    if (!user) {
      toast.error("Couldn't start a session — check your connection and try again.");
      resumeScanning();
      return;
    }

    const card = await getCardById(supabase, code);
    if (!card) {
      toast.error(`"${code}" isn't a Tongs & Tongues coaster.`);
      resumeScanning();
      return;
    }

    const result = await collectCard(supabase, user.id, code);

    if (result.status === "already_collected") {
      toast.info(`Already collected: ${card.word} (${card.item_name})`);
    } else if (result.status === "collected") {
      toast.success(`Collected! ${card.word} — ${card.item_name}`);
    }

    setState({
      status: "result",
      card,
      alreadyCollected: result.status === "already_collected",
    });
    if (result.status === "collected") emberBurst(45);
  }

  function resumeScanning() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    setState({ status: "scanning" });
    scanner.resume();
  }

  const revealStyle =
    state.status === "result"
      ? COASTER_STYLES[state.card.item_slug as ItemSlug]
      : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="sticker-border relative aspect-square w-full max-w-sm overflow-hidden rounded-[28px] bg-weber-black">
        <div id={elementId} ref={containerRef} className="size-full [&_video]:size-full [&_video]:object-cover" />

        {state.status === "scanning" && (
          <>
            <svg
              viewBox="0 0 120 120"
              className="pointer-events-none absolute inset-0 m-auto size-28 opacity-80"
              aria-hidden
            >
              <path d="M6 30V12a6 6 0 0 1 6-6h18" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M114 30V12a6 6 0 0 0-6-6H90" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M6 90v18a6 6 0 0 0 6 6h18" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M114 90v18a6 6 0 0 1-6 6H90" stroke="var(--weber-ember-start)" strokeWidth="5" fill="none" strokeLinecap="round" />
            </svg>
            <div
              className="animate-scanline pointer-events-none absolute inset-x-6 top-6 h-[3px] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--weber-ember-start), transparent)",
                boxShadow: "0 0 12px oklch(0.72 0.19 45 / 80%)",
              }}
            />
          </>
        )}

        {state.status === "camera_error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-weber-black p-6 text-center text-weber-cream">
            <CameraOff className="size-8" />
            <p className="font-heading uppercase tracking-wide">
              Camera unavailable
            </p>
            <p className="text-sm text-weber-cream/70">
              Allow camera access in your browser settings, then reload this
              page.
            </p>
          </div>
        )}

        {state.status === "result" && revealStyle && (
          <div className="absolute inset-0 flex items-center justify-center bg-weber-black/90 p-6">
            <div className="animate-coaster-drop relative size-48">
              <div className="coaster-shape coaster-frame sticker-border absolute inset-0 bg-card" />
              <div className="coaster-shape absolute inset-[7px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-weber-black/20 text-center">
                <div
                  className="mb-1.5 flex size-11 items-center justify-center rounded-full font-heading text-sm font-semibold text-weber-black"
                  style={{ background: revealStyle.badgeBg }}
                >
                  {revealStyle.mono}
                </div>
                <p className="font-heading text-[11px] uppercase tracking-wide text-muted-foreground">
                  {state.card.language}
                </p>
                <p className="mt-0.5 text-lg font-semibold text-foreground">
                  {state.card.word}
                </p>
                <p className="mt-1 text-xs italic text-muted-foreground">
                  {state.card.phonetic}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {state.status === "result" && (
        <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            {state.alreadyCollected ? (
              "Already in your collection"
            ) : (
              <>
                You unlocked <strong className="text-foreground">{state.card.item_name}</strong> in{" "}
                <strong className="text-foreground">{state.card.language}</strong>
              </>
            )}
          </p>
          <Button
            onClick={resumeScanning}
            variant="secondary"
            className="btn-sticker h-12 w-full rounded-2xl font-heading uppercase tracking-wide"
          >
            <RotateCcw className="size-4" />
            Scan Next Coaster
          </Button>
        </div>
      )}

      {state.status !== "result" && (
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Point your camera at the QR code on the coaster to collect it
          automatically.
        </p>
      )}
    </div>
  );
}
