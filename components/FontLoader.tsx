"use client";

import { useEffect } from "react";

export function FontLoader() {
  useEffect(() => {
    // Add Material Symbols font
    const materialSymbolsLink = document.createElement("link");
    materialSymbolsLink.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    materialSymbolsLink.rel = "stylesheet";
    document.head.appendChild(materialSymbolsLink);

    // Add Inter font if not already present
    const interLink = document.createElement("link");
    interLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap";
    interLink.rel = "stylesheet";
    document.head.appendChild(interLink);
  }, []);

  return null;
}