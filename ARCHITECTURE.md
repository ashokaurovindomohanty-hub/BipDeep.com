# Eon Architecture

## System Overview

Eon is a distributed social media platform built on the Internet Computer blockchain using React and Motoko.

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Layer (React)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Feed Module  │  │ Live Streams │  │ NFT Marketplace    │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Chat Module  │  │ Creator Prof │  │ Creator Dashboard  │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   Backend Layer (Motoko)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ User Actor   │  │ Post Actor   │  │ Comment Actor      │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Chat Actor   │  │ Stream Actor │  │ NFT Actor          │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ Earnings     │  │ Moderation   │  │ Media Storage      │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

**Technology Stack:**
- React 19 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Radix UI for accessible components
- Motion for animations
- Sonner for notifications

**Module Structure:**
```
src/frontend/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and backend services
├── types/              # TypeScript interfaces
├── utils/              # Helper functions
└── generated/          # Auto-generated canister declarations
```

## Backend Architecture

**Motoko Canister Structure:**
- `main.mo` - Entry point and actor composition
- User management and authentication
- Post creation and engagement (likes, comments, shares)
- Live streaming coordination
- Direct messaging
- NFT marketplace tracking
- Creator earnings calculations
- Content moderation system

**Key Actors:**
- `UserActor` - User profiles and authentication
- `PostActor` - Feed content management
- `CommentActor` - Comment threads
- `ChatActor` - Direct messaging
- `StreamActor` - Live stream management
- `NFTActor` - Marketplace and NFT operations
- `EarningsActor` - Creator payouts

## Data Flow

1. **User Action** → React Component triggers
2. **Service Call** → Frontend service calls canister
3. **Motoko Processing** → Actor receives and processes request
4. **State Update** → Actor updates internal state
5. **Response** → Return result to frontend
6. **UI Update** → React component re-renders with new data

## Security Considerations

- **Identity**: Internet Computer's built-in identity system
- **Canister Authorization**: Principal-based access control
- **Data Validation**: Input sanitization on both frontend and backend
- **Rate Limiting**: Backend rate limiting on sensitive operations
- **Content Moderation**: AI moderation badge system

## Scalability

- **Horizontal**: Multiple canister instances for different features
- **Vertical**: Canister memory management and optimization
- **Caching**: Frontend-side caching with React hooks
- **Pagination**: Lazy-loaded feeds and lists

## Deployment

- **Frontend**: Deployed to IC via dfx
- **Backend**: Motoko canisters deployed to IC
- **Assets**: Served from canister asset storage
- **DNS**: Custom domain support via ic-domains

