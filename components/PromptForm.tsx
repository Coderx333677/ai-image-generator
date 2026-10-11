"use client";

import { useState } from "react";

interface PromptFormProps {
    onSubmit: (prompt: string) => void;
    isLoading: boolean;
}

export default function PromptForm({onSubmit, isLoading} : PromptFormProps){

    const [prompt, setprompt] = useState(""); // a variable to store value and also function to set it 

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault(); // Stop page refresh
        if (!prompt.trim()) return; // Don't submit empty prompts
        onSubmit(prompt); // Send the prompt up to page.tsx
    };

    return(

        <form onSubmit={handleSubmit} className="w-full max-w-xl flex gap-2">

            <input
                type="text"
                placeholder="Describe your image..."
                value={prompt}
                onChange={(e) => setprompt(e.target.value)}
                className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"

            />

            <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
                {isLoading ? "Generating..." : "Generate"}
            </button>






        </form>

    )
}