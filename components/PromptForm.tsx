"use client";

import { Suspense, useState } from "react";
import ImageSlider from "@/components/Img_Slider";


interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}


export default function PromptForm({ onSubmit, isLoading }: PromptFormProps) {
    const [prompt, setPrompt] = useState("");
    // ... inside your component
    
    

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    onSubmit(trimmedPrompt);
  };

  return (
    <form
      onSubmit={handleSubmit}
      // CHANGED: Increased max-width and added more padding
      className="w-screen md:w-[85vw] max-w-7xl space-y-4 rounded-3xl bg-white/80 p-6  backdrop-blur-sm"
    >
        {/* CHANGED: Gap increased slightly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex flex-col justify-between">


                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">Free AI Image Generator</h1>
                    <p className="text-lg text-gray-700 leading-relaxed text-justify mb-6">
                        Convert text-to-image instantly. Describe your idea, product shots, character art, social media graphics, logo concepts, and ImagineArt generates photorealistic or stylized images matching your exact vision. No design skills required.
                    </p>
                </div>

                <div className="rounded-3xl bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 p-0.5 shadow-lg w-full">
  
                <div className="rounded-[22px] bg-white w-full">
                    <label htmlFor="prompt" className="sr-only">
                    Image prompt
                    </label>
                    <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="Describe the image you want to create..."
                    disabled={isLoading}
                    className="w-full min-h-37.5 resize-none bg-transparent py-4 px-6 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                    />
                </div>

                </div>

                <div className="flex items-center justify-between gap-3 mt-4">
                    <p className="text-sm text-gray-500">
                    {prompt.trim() ? `${prompt.trim().length} characters` : "Start typing a prompt"}
                    </p>

                    <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    // CHANGED: Made button slightly larger
                    className="rounded-full bg-linear-to-r from-purple-600 to-orange-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {isLoading ? "Generating..." : "Generate image"}
                    </button>
                </div>
            </div>

            <Suspense
                fallback={<div className="h-64 w-full max-w-2xl rounded-xl bg-gray-100" />}
            >
                <ImageSlider />
            </Suspense>

        </div>
    </form>
  )
}
