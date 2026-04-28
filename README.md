 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index 8b137891791fe96927ad78e64b0aad7bded08bdc..f3ccae16b0ad556ea7a53070881c15e69fb953d2 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,55 @@
+# Eon — Echoing Original Narratives
 
+Eon is a mobile-first social media prototype built with a React frontend and a Motoko backend, designed for short-form videos, live streaming, chat, NFT marketplace interactions, and creator monetization workflows.
+
+## Project Status
+
+This repository now includes a complete end-to-end prototype implementation with:
+
+- Feed with 10-minute video support, engagement actions, and AI moderation badge simulation.
+- Live tab with stream cards, viewer counts, and LIVE indicators.
+- Chat tab with conversations and message thread simulation.
+- NFT marketplace with listing cards and buy/sell simulation states.
+- Profile tab with follower/following stats, content tabs, creator earnings dashboard, and creator upload tool.
+- Login/signup modal UI for account access flow simulation.
+- Motoko backend actor definitions for users, posts, comments, likes, chat messages, live streams, NFTs, and earnings.
+
+## Tech Stack
+
+- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Motion, Sonner
+- **Backend:** Motoko actor canister modules (`main.mo`)
+- **Tooling:** pnpm workspace, Biome, TypeScript
+
+## Run Locally
+
+```bash
+pnpm install
+pnpm typecheck
+pnpm check
+pnpm build
+```
+
+## Workspace Layout
+
+- `src/frontend/` — UI app, feature pages, hooks, generated canister declarations.
+- `src/backend/` — Motoko source modules for canister actor and mixins.
+- `scripts/` — utility scripts for asset/image processing.
+
+## Feature Coverage Snapshot
+
+| Area | Status |
+|---|---|
+| Feed (likes/comments/shares + 10m limit messaging) | ✅ |
+| Live stream listing and viewer counts | ✅ |
+| Direct messages UI | ✅ |
+| NFT marketplace cards | ✅ |
+| User profile stats and content grid | ✅ |
+| Creator earnings dashboard | ✅ |
+| Creator upload tool (with 10-minute validation + moderation simulation) | ✅ |
+| Login/signup UI flow | ✅ |
+| Bottom mobile navigation | ✅ |
+
+## Notes
+
+- Current data is sample-driven in the frontend for rapid prototyping.
+- Backend actor APIs are scaffolded and can be wired into frontend queries/mutations for production use.
 
EOF
)
