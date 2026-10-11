"use client"; // This must be a client component because it uses useState

import { useState } from "react";
import PromptForm from "@/components/PromptForm";
import NavigationBar from "@/components/NavigationBar";


export default function Home() {

  const pic = "dsf"

  return (
    <main className="min-h-screen bg-red-100 flex flex-col items-center py-12 px-4 pt-20.5 ">


      <NavigationBar />
      
      
      {/* Header */}

      <div className="text-center mb-10">

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
          AI Image Generator
        </h1>

        <p className="text-gray-500">
          Describe anything you can imagine.
        </p>

      </div>

      {/* Our Component 1: The Form */}
      {/* <PromptForm onSubmit={pic} isLoading={false} /> */}

  

    </main>
  );
}