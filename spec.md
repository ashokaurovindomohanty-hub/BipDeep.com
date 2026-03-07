# Eon - Social Media App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full social media platform called "Eon" with tagline "Echoing Original Narratives"
- EonFeed: main video/post feed with like, comment, share actions; supports videos up to 10 minutes
- EonLive: live streaming section with viewer count, live badges, and stream listings
- EonChat: direct messaging UI with conversation list and message thread view
- EonMarket: NFT marketplace for buying/selling unique digital content; listings with price and creator info
- Creator dashboard: revenue share display, earnings stats, upload tool
- User profiles with follower/following counts, bio, avatar, and content grid
- Authentication: login/signup with username, email, password
- Navigation: bottom tab bar (mobile-style) with icons for Feed, Live, Chat, Market, Profile
- Attractive Eon logo (custom generated asset)
- AI moderation badge/indicator on content (simulated)
- Sample content: video cards, NFT listings, live streams, chat conversations

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Generate Eon logo image asset
2. Select components: authorization, blob-storage
3. Generate Motoko backend with actors for: users, posts/videos, NFT listings, chat messages, live streams, creator earnings
4. Build React frontend:
   - App shell with bottom navigation (Feed, Live, Chat, Market, Profile)
   - EonFeed: scrollable video card feed, like/comment/share, video metadata
   - EonLive: live stream grid with viewer counts and join buttons
   - EonChat: conversation list + message thread view
   - EonMarket: NFT grid with buy/sell flow, price display
   - Profile page: avatar, stats, content grid, creator earnings
   - Auth modal: login/signup forms
   - Eon logo prominently in header/splash
5. Deploy
