import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "node:child_process";

const allowedHosts = [
  "distribuidorasis-production.up.railway.app",
  "www.distribuidorasis.com.mx",
  "staging.distribuidorasis.com.mx",
  "localhost",
];

const resolveGitCommitSha = () => {
  if (process.env.VITE_APP_GIT_SHA) {
    return process.env.VITE_APP_GIT_SHA;
  }

  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unknown";
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    allowedHosts,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    __APP_COMMIT_SHA__: JSON.stringify(resolveGitCommitSha()),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
