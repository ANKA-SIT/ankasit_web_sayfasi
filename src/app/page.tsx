"use client";
import React from "react";

export default function AnkaSitRootPage() {
  return (
    <main className="w-screen h-screen bg-black overflow-hidden">
      <iframe
        src="/index-standalone.html"
        title="Düzce Üniversitesi ANKA-SİT Platformu"
        className="w-full h-full border-0"
      />
    </main>
  );
}
