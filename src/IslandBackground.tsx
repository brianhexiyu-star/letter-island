import React from "react";
import "./islandBackground.css";

export default function IslandBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="island-root">
      {/* soft blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      {/* noise overlay */}
      <div className="noise" />

      {/* content */}
      <div className="content">{children}</div>
    </div>
  );
}
