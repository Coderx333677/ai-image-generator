
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NavigationBar() {


  const [openMenu, setOpenMenu] = useState<string | null>(null); // by default null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close drawer on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navItemClass =
    "rounded-[10px] px-4 py-1.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-16 w-full border-b border-gray-100 bg-white/95 backdrop-blur"
      onMouseLeave={() => setOpenMenu(null)}
    >

      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold tracking-tight text-black"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-black text-lg text-white">
            ✦
          </span>
          Pixora AI
        </Link>

        {/* ── DESKTOP NAV ───────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
        >
          <Link
            href="/blog"
            className={navItemClass}
            onMouseEnter={() => setOpenMenu(null)}
            onClick={() => setOpenMenu(null)}
          >
            Blog
          </Link>

          {["Tools", "Community"].map((name) => (
            <div key={name} onMouseEnter={() => setOpenMenu(name)}>
              <button
                type="button"
                onClick={() => setOpenMenu(name)}
                className={`${navItemClass} inline-flex items-center gap-2`}
                aria-expanded={openMenu === name}
              >
                {name}
                <span aria-hidden="true" className="text-xs">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    style={{
                      transform:
                        openMenu === name ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
            </div>
          ))}

          <Link
            href="/affiliate"
            className={navItemClass}
            onMouseEnter={() => setOpenMenu(null)}
          >
            Affiliate
          </Link>
          <Link
            href="/api"
            className={navItemClass}
            onMouseEnter={() => setOpenMenu(null)}
          >
            API
          </Link>
          <Link
            href="/creators"
            className={navItemClass}
            onMouseEnter={() => setOpenMenu(null)}
          >
            Creators
          </Link>
          <Link
            href="/pricing"
            className={navItemClass}
            onMouseEnter={() => setOpenMenu(null)}
          >
            Pricing
          </Link>
        </nav>

        {/* ── RIGHT SIDE: Launch App + Hamburger ────────────── */}
        <div className="flex items-center gap-2">
          {/* Desktop Launch App */}
          <Link
            href="/app"
            className="hidden rounded-[10px] bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 lg:inline-flex"
          >
            Launch App
          </Link>

          {/* Mobile Launch App */}
         

          {/* Hamburger (mobile + tablet only) */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="grid size-10 place-items-center rounded-[10px] hover:bg-gray-100 lg:hidden"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── TOOLS MEGA MENU ─────────────────────────────────── */}
      {openMenu === "Tools" && (
        <div
          onMouseEnter={() => setOpenMenu("Tools")}
          className="absolute left-0 top-full w-full border-t border-gray-100 bg-white shadow-xl"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-10 px-6 py-10">
            {/* Featured column */}
            <div>
              <h3 className="mb-4 text-sm font-bold text-black">
                Editing Tools
              </h3>
              <ul className="space-y-5">
                <li className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gray-100">
                    ✎
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      AI Image Editor
                    </p>
                    <p className="text-xs text-gray-500">
                      Edit, retouch, and transform images with AI.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gray-100">
                    ✦
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">
                      Kling AI Motion Control
                    </p>
                    <p className="text-xs text-gray-500">
                      Add dynamic motion to static images.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* 3 link columns */}
            <div className="col-span-3 grid grid-cols-3 gap-10 border-l border-gray-100 pl-10">
              <div>
                <h3 className="mb-4 text-sm font-semibold text-purple-600">
                  AI Image Generator
                </h3>
                <ul className="space-y-3">
                  {[
                    "BG Remover",
                    "AI Image Combiner",
                    "AI Image Face Swap",
                    "AI Image Replace",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-gray-700 hover:text-black"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold text-purple-600">
                  AI Video Generator
                </h3>
                <ul className="space-y-3">
                  {[
                    "AI HeyGen Avatar",
                    "AI Video Object Removal",
                    "AI Video Recolor",
                    "AI Video Background Changer",
                    "AI Video Editor",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-gray-700 hover:text-black"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold text-purple-600">
                  Popular
                </h3>
                <ul className="space-y-3">
                  {[
                    "Text to Image",
                    "Image Upscaler",
                    "Photo Enhancer",
                    "AI Avatar",
                  ].map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-gray-700 hover:text-black"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMUNITY MEGA MENU ─────────────────────────────── */}
      {openMenu === "Community" && (
        <div
          onMouseEnter={() => setOpenMenu("Community")}
          className="absolute left-0 top-full w-full border-t border-gray-100 bg-white shadow-xl"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-10 px-6 py-10">
            {/* Copy block */}
            <div>
              <h3 className="mb-4 text-sm font-bold text-black">Connect</h3>
              <p className="text-sm leading-relaxed text-gray-600">
                Unlock the future of creativity with our Generative AI
                community—where art, video, and images are born from the power
                of AI imagination!
              </p>
            </div>

            {/* 3 link columns */}
            <div className="col-span-3 grid grid-cols-3 gap-10 border-l border-gray-100 pl-10">
              <ul className="space-y-4">
                {[
                  ["Discord", "/community/discord"],
                  ["Facebook", "/community/facebook"],
                  ["Instagram", "/community/instagram"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-black"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="space-y-4">
                {[
                  ["Pinterest", "/community/pinterest"],
                  ["Reddit", "/community/reddit"],
                  ["Snapchat", "/community/snapchat"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-black"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <ul className="space-y-4">
                {[
                  ["Twitter", "/community/twitter"],
                  ["YouTube", "/community/youtube"],
                  ["WhatsApp", "/community/whatsapp"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-black"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE / TABLET DRAWER ──────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 h-dvh w-[85%] max-w-sm overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <span className="text-lg font-bold">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-[10px] hover:bg-gray-100"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="p-5">
              <Link
                href="/blog"
                className="block border-b border-gray-100 py-3 text-base font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Blog
              </Link>

              {["Tools", "Community"].map((name) => (
                <div
                  key={name}
                  className="border-b border-gray-100 last:border-0"
                >
                  <button
                    onClick={() =>
                      setMobileSubmenu(mobileSubmenu === name ? null : name)
                    }
                    className="flex w-full items-center justify-between py-3 text-base font-semibold"
                    aria-expanded={mobileSubmenu === name}
                  >
                    {name}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      style={{
                        transform:
                          mobileSubmenu === name
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform .2s",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {mobileSubmenu === name && (
                    <ul className="pb-3 pl-3">
                      {(name === "Tools"
                        ? [
                            "BG Remover",
                            "AI Image Combiner",
                            "AI Image Face Swap",
                            "Text to Image",
                            "Image Upscaler",
                            "AI Video Editor",
                          ]
                        : [
                            "Discord",
                            "Facebook",
                            "Instagram",
                            "Twitter",
                            "YouTube",
                            "Reddit",
                          ]
                      ).map((item) => (
                        <li key={item}>
                          <Link
                            href="#"
                            className="block py-2 text-sm text-gray-700"
                            onClick={() => setMobileOpen(false)}
                          >
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {[
                ["Affiliate", "/affiliate"],
                ["API", "/api"],
                ["Creators", "/creators"],
                ["Pricing", "/pricing"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="block border-b border-gray-100 py-3 text-base font-semibold last:border-0"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/app"
                className="mt-6 block rounded-[10px] bg-black px-5 py-3 text-center text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Launch App
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}