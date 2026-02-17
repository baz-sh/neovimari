import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "src/popup/popup.html", dest: "." },
        { src: "src/popup/popup.css", dest: "." },
      ],
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: "src/popup/popup.ts",
      name: "neovimariPopup",
      formats: ["iife"],
      fileName: () => "popup.js",
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
});
