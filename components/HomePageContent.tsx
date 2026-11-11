"use client";

import { useState, useEffect, useRef } from "react";
import NavigationBar from "@/components/NavigationBar";
import PromptForm from "@/components/PromptForm";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";

const MIN_PROMPT_LENGTH = 10;
// Same container width for the prompt section AND the generated section.
// Change this one value if the upper section uses a different max width.
const CONTENT_WIDTH = "max-w-7xl";
const GRADIENT = "bg-linear-to-r from-purple-600 to-orange-500";

type ErrorType = "generic" | "limit" | "blocked";
type GenError = { type: ErrorType; message: string };
type HistoryItem = { url: string; prompt: string };

const STAGES = [
  "Understanding your prompt",
  "Composing the scene",
  "Rendering details",
];

const TIPS = [
  'Add lighting + camera angle (e.g. "golden hour, low angle") for better results.',
  "Describe the subject first, then the place, then the mood.",
  'Mention a style like "photorealistic" or "watercolor" to guide the look.',
];

// Small inline icons (no extra dependency)
function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  download: "M12 3v12m0 0l-4-4m4 4l4-4M4 21h16",
  refresh: "M3 12a9 9 0 0115-6.7L21 8m0-5v5h-5M21 12a9 9 0 01-15 6.7L3 16m0 5v-5h5",
  expand: "M8 3H3v5m13-5h5v5M8 21H3v-5m18 0v5h-5",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  check: "M5 13l4 4L19 7",
  up: "M7 11v9H4v-9h3zm0 0l4-8a2 2 0 012 2v4h6a2 2 0 012 2.3l-1 6A2 2 0 0117 20H7",
  down: "M17 13V4h3v9h-3zm0 0l-4 8a2 2 0 01-2-2v-4H5a2 2 0 01-2-2.3l1-6A2 2 0 017 4h10",
  close: "M6 6l12 12M18 6L6 18",
  prev: "M15 18l-6-6 6-6",
  next: "M9 18l6-6-6-6",
};

export default function HomePageContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [activePrompt, setActivePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GenError | null>(null);
  const [promptError, setPromptError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const sliderRef = useRef<HTMLUListElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const supabase = createClient();

  // 1. Returning from Auth redirect with saved prompt
  useEffect(() => {
    const savedPrompt = localStorage.getItem("pixora_pending_prompt");
    if (savedPrompt) {
      setPendingPrompt(savedPrompt);
      localStorage.removeItem("pixora_pending_prompt");

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          executeGeneration(savedPrompt);
        }
      });
    }
  }, []);

  // 2. Loading timer
  useEffect(() => {
    if (!isLoading) return;
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isLoading]);

  // 3. Close lightbox with Escape
  useEffect(() => {
    if (!showLightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLightbox]);

  // 4. Auto-scroll to the generation section as soon as generating starts
  useEffect(() => {
    if (!isLoading) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [isLoading]);

  // 5. Load the user's latest saved generations (history persists across sessions)
  useEffect(() => {
    const loadRecent = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: rows } = await supabase
        .from("generations")
        .select("prompt, image_path")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!rows?.length) return;

      const { data: signed } = await supabase.storage
        .from("generated-images")
        .createSignedUrls(
          rows.map((r) => r.image_path),
          3600
        );
      if (!signed) return;

      const items = rows
        .map((r, i) => ({ url: signed[i]?.signedUrl ?? "", prompt: r.prompt }))
        .filter((item) => item.url);

      setHistory((prev) => (prev.length ? prev : items));
    };
    loadRecent();
  }, []);

  // 6. Slider arrows: enable/disable depending on scroll position
  const updateArrows = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [history]);

  const scrollSlider = (dir: 1 | -1) => {
    const el = sliderRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * el.clientWidth * 0.8,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  // Click a past image: show it in the main result area and scroll up to it
  const selectFromHistory = (item: HistoryItem) => {
    setError(null);
    setImageLoaded(false);
    setImageUrl(item.url);
    setActivePrompt(item.prompt);
    setFeedback(null);
    setTimeout(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultRef.current?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }, 50);
  };

  const stage = elapsed < 3 ? 0 : elapsed < 8 ? 1 : 2;
  const progress = Math.min(95, Math.round(100 * (1 - Math.exp(-elapsed / 10))));
  const tip = TIPS[Math.floor(elapsed / 6) % TIPS.length];

  const executeGeneration = async (promptText: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setPromptError("");
    setImageUrl("");
    setImageLoaded(false);
    setFeedback(null);
    setActivePrompt(promptText);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setPendingPrompt(promptText);
        setShowAuthModal(true);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ prompt: promptText }),
          signal: controller.signal,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Adjust these status codes to match your edge function
        const type: ErrorType =
          response.status === 429
            ? "limit"
            : response.status === 422
            ? "blocked"
            : "generic";
        setError({ type, message: result.error || "Failed to generate image" });
        return;
      }

      if (result.signedUrl) {
        setImageUrl(result.signedUrl);
        setHistory((prev) =>
          [{ url: result.signedUrl, prompt: promptText }, ...prev].slice(0, 20)
        );
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      setError({
        type: "generic",
        message: err?.message || "An error occurred during generation",
      });
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  const handleGenerate = async (prompt: string) => {
    if (prompt.trim().length < MIN_PROMPT_LENGTH) {
      setPromptError(
        `Please write at least ${MIN_PROMPT_LENGTH} characters. Try: "red sports car on a beach at sunset".`
      );
      return;
    }
    setPromptError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setPendingPrompt(prompt);
      setShowAuthModal(true);
      return;
    }

    executeGeneration(prompt);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "pixora-ai-image.png";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(activePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked, ignore */
    }
  };

  const handleSignInRedirect = () => {
    if (pendingPrompt) {
      localStorage.setItem("pixora_pending_prompt", pendingPrompt);
    }
    window.location.href = "/login";
  };

  const iconBtn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75 focus-visible:outline-2 focus-visible:outline-white";

  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-12 px-4 pt-20.5">
      <style>{`
        @keyframes pixora-float-a { 0%,100% { transform: translate(-10%,-10%) scale(1); } 50% { transform: translate(35%,25%) scale(1.25); } }
        @keyframes pixora-float-b { 0%,100% { transform: translate(30%,30%) scale(1.1); } 50% { transform: translate(-15%,-20%) scale(0.9); } }
        @keyframes pixora-sweep { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>

      <NavigationBar />

      <div className={`w-full ${CONTENT_WIDTH} flex flex-col items-center`}>
        {/* PromptForm is disabled while isLoading (prompt locked) */}
        <PromptForm onSubmit={handleGenerate} isLoading={isLoading} />

        {promptError && (
          <p role="alert" className="mt-3 w-full max-w-xl text-sm text-red-700">
            {promptError}
          </p>
        )}

        {(isLoading || error || imageUrl) && (
          <section ref={resultRef} className="mt-8 w-full scroll-mt-24">
            {/* ---------- STATE 1: LOADING ---------- */}
            {isLoading && (
              <div
                role="status"
                aria-live="polite"
                className="grid items-stretch gap-6 md:grid-cols-2 lg:gap-8"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-950 shadow-xl md:order-1">
                  <div className="absolute -left-10 -top-10 h-3/4 w-3/4 rounded-full bg-purple-600/70 blur-3xl animate-[pixora-float-a_7s_ease-in-out_infinite] motion-reduce:animate-none" />
                  <div className="absolute -bottom-10 -right-10 h-3/4 w-3/4 rounded-full bg-orange-500/60 blur-3xl animate-[pixora-float-b_9s_ease-in-out_infinite] motion-reduce:animate-none" />
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-[pixora-sweep_2.4s_linear_infinite] motion-reduce:animate-none" />

                  <div className="relative flex h-full items-center justify-center p-6 text-white">
                    <ol className="flex flex-col gap-3 text-left text-sm">
                      {STAGES.map((label, i) => {
                        const done = i < stage;
                        const active = i === stage;
                        return (
                          <li
                            key={label}
                            className={`flex items-center gap-3 ${
                              done || active ? "text-white" : "text-white/60"
                            }`}
                          >
                            <span className="flex h-5 w-5 items-center justify-center">
                              {done ? (
                                <Icon d={ICONS.check} className="h-5 w-5" />
                              ) : active ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent motion-reduce:animate-none" />
                              ) : (
                                <span className="h-2 w-2 rounded-full bg-white/50" />
                              )}
                            </span>
                            <span className={active ? "font-semibold" : undefined}>
                              {label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20">
                    <div
                      className={`h-full ${GRADIENT} transition-all duration-1000`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-4 md:order-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">YOUR PROMPT</p>
                    <p className="mt-1 line-clamp-4 text-base text-gray-900">
                      {activePrompt}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {elapsed}s &middot; usually takes about 15s
                  </p>
                  <p className="text-sm text-gray-600">Tip: {tip}</p>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="min-h-11 self-start rounded-xl border border-gray-300 px-5 font-medium text-gray-800 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ---------- ERRORS ---------- */}
            {error && !isLoading && (
              <div
                role="alert"
                className="mx-auto w-full max-w-xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error.type === "limit" && (
                  <>
                    <p className="font-semibold">You've reached your free limit.</p>
                    <p className="mt-1">
                      Upgrade or come back tomorrow to keep generating.
                    </p>
                    <a
                      href="/pricing"
                      className={`mt-3 inline-flex min-h-11 items-center rounded-full px-6 font-semibold text-white ${GRADIENT}`}
                    >
                      See pricing
                    </a>
                  </>
                )}

                {error.type === "blocked" && (
                  <>
                    <p className="font-semibold">This prompt can't be generated.</p>
                    <p className="mt-1">Try rephrasing it.</p>
                  </>
                )}

                {error.type === "generic" && (
                  <>
                    <p className="font-semibold">{error.message}</p>
                    <p className="mt-1">
                      Your prompt is saved. Try again in a moment.
                    </p>
                    <button
                      type="button"
                      onClick={() => executeGeneration(activePrompt)}
                      className="mt-3 min-h-11 rounded-xl bg-black px-5 font-semibold text-white hover:bg-gray-800"
                    >
                      Try again
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ---------- STATE 2: RESULT ---------- */}
            {imageUrl && !isLoading && (
              <div className="grid items-stretch gap-6 md:grid-cols-2 lg:gap-8">
                <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-xl md:order-1">
                  <img
                    src={imageUrl}
                    alt={activePrompt || "Generated AI Art"}
                    onLoad={() => setImageLoaded(true)}
                    className={`h-full w-full object-contain transition-all duration-700 ease-out motion-reduce:transition-none ${
                      imageLoaded ? "scale-100 blur-0" : "scale-105 blur-2xl"
                    }`}
                  />
                  <div className="absolute right-3 top-3 flex gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => setShowLightbox(true)}
                      aria-label="View full size"
                      className={iconBtn}
                    >
                      <Icon d={ICONS.expand} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      aria-label="Download image"
                      className={iconBtn}
                    >
                      <Icon d={ICONS.download} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-5 md:order-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">YOUR PROMPT</p>
                    <p className="mt-1 line-clamp-4 text-base text-gray-900">
                      {activePrompt}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex min-h-11 items-center gap-2 rounded-xl bg-black px-5 font-semibold text-white hover:bg-gray-800"
                    >
                      <Icon d={ICONS.download} className="h-4 w-4" />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => executeGeneration(activePrompt)}
                      className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 font-medium text-gray-800 hover:bg-gray-50"
                    >
                      <Icon d={ICONS.refresh} className="h-4 w-4" />
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="flex min-h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 font-medium text-gray-800 hover:bg-gray-50"
                    >
                      <Icon
                        d={copied ? ICONS.check : ICONS.copy}
                        className="h-4 w-4"
                      />
                      {copied ? "Copied" : "Copy prompt"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Like this result?</span>
                    <button
                      type="button"
                      aria-label="Good result"
                      aria-pressed={feedback === "up"}
                      onClick={() => setFeedback("up")}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                        feedback === "up"
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <Icon d={ICONS.up} className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Bad result"
                      aria-pressed={feedback === "down"}
                      onClick={() => setFeedback("down")}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                        feedback === "down"
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      <Icon d={ICONS.down} className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600">
                    Want changes? Edit the prompt above and generate again.
                  </p>

                </div>
              </div>
            )}
          </section>
        )}

        {/* ---------- HISTORY SLIDER ---------- */}
        {history.length > 0 && (
          <section aria-label="Your previous generations" className="mt-10 w-full">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900">
                Your previous generations
              </h2>
              <div className="flex items-center gap-2">
                <a
                  href="/history"
                  className="mr-2 text-sm font-semibold text-gray-900 underline hover:text-gray-600"
                >
                  View all history
                </a>
                <button
                  type="button"
                  onClick={() => scrollSlider(-1)}
                  disabled={!canPrev}
                  aria-label="Previous images"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Icon d={ICONS.prev} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(1)}
                  disabled={!canNext}
                  aria-label="Next images"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-40"
                >
                  <Icon d={ICONS.next} />
                </button>
              </div>
            </div>

            <ul
              ref={sliderRef}
              onScroll={updateArrows}
              className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {history.map((item) => (
                <li key={item.url} className="w-44 shrink-0 snap-start sm:w-52">
                  <button
                    type="button"
                    onClick={() => selectFromHistory(item)}
                    aria-label={`Show image: ${item.prompt}`}
                    className="block w-full text-left"
                  >
                    <span
                      className={`block aspect-square w-full overflow-hidden rounded-2xl border-2 bg-gray-100 ${
                        item.url === imageUrl
                          ? "border-black"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="mt-2 line-clamp-2 block text-sm text-gray-800">
                      {item.prompt}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* ---------- LIGHTBOX ---------- */}
      {showLightbox && imageUrl && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowLightbox(false);
          }}
        >
          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            aria-label="Close full size view"
            className={`${iconBtn} absolute right-4 top-4`}
          >
            <Icon d={ICONS.close} />
          </button>
          <img
            src={imageUrl}
            alt={activePrompt || "Generated AI Art"}
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </div>
      )}

      {/* ---------- AUTH MODAL (unchanged) ---------- */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuthModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="auth-modal-title"
                  className="text-2xl font-bold text-gray-900"
                >
                  Start creating with Pixora AI
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Create a free account or sign in to generate your image.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                aria-label="Close dialog"
                className="text-2xl text-gray-500 hover:text-black"
              >
                &times;
              </button>
            </div>

            {pendingPrompt && (
              <div className="mt-5 rounded-xl bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">
                  YOUR IMAGE PROMPT
                </p>
                <p className="mt-1 line-clamp-3 text-sm text-gray-800">
                  {pendingPrompt}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSignInRedirect}
                className="rounded-xl bg-black px-5 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
              >
                Sign in / Create account
              </button>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Maybe later
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Your prompt will remain saved while you sign in.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}