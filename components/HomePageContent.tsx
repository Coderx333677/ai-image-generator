"use client";

import NavigationBar from "@/components/NavigationBar";
import PromptForm from "@/components/PromptForm";

export default function HomePageContent() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-12 px-4 pt-20.5">
      <NavigationBar />
      <PromptForm onSubmit={() => {}} isLoading={false} />
    </main>
  );
}
