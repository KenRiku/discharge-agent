"use client";

import { Nav } from "./nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Nav />
      <main
        style={{
          flex: 1,
          marginLeft: "220px",
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
