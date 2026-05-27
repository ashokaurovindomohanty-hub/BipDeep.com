import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type {
  Post,
  Comment,
  LiveStream,
  NFT,
  Message,
  UserProfile,
} from "../backend";

// Utility to safely stringify BigInt or numeric values returned from the actor
const safeBigIntToString = (value: unknown): string => {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value;
  // fallback
  try {
    // @ts-ignore
    return value?.toString() ?? "0";
  } catch {
    return "0";
  }
};

export type UserStats = {
  followerCount: string;
  followingCount: string;
  totalPosts: string;
};

const stringifyUserStats = (s: { followerCount: bigint; followingCount: bigint; totalPosts: bigint }): UserStats => ({
  followerCount: safeBigIntToString(s.followerCount),
  followingCount: safeBigIntToString(s.followingCount),
  totalPosts: safeBigIntToString(s.totalPosts),
});

// ─── Posts / Feed ─────────────────────────────────────────────────────────

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[], Error>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5_000,
  });
}

export function useGetPostLikesCount(postId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string, Error>({
    queryKey: ["postLikes", postId],
    queryFn: async () => {
      if (!actor || !postId) return "0";
      const result = await actor.getPostLikesCount(postId);
      return safeBigIntToString(result);
    },
    enabled: !!actor && !isFetching && !!postId,
    staleTime: 2_000,
  });
}

export function useGetCommentsForPost(postId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor || !postId) return [];
      return actor.getCommentsForPost(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
    staleTime: 5_000,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { previous?: string }>(
    async (postId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.likePost(postId);
    },
    {
      onMutate: async (postId: string) => {
        await queryClient.cancelQueries({ queryKey: ["postLikes", postId] });
        const previous = queryClient.getQueryData<string>(["postLikes", postId]);
        const prevBig = BigInt(previous ?? "0");
        queryClient.setQueryData(["postLikes", postId], (prev) => (prevBig + 1n).toString());
        return { previous };
      },
      onError: (err, postId, context) => {
        if (context?.previous) {
          queryClient.setQueryData(["postLikes", postId], context.previous);
        }
        // rethrow or log if needed
        // console.error(err);
      },
      onSettled: (_data, _err, postId) => {
        void queryClient.invalidateQueries({ queryKey: ["postLikes", postId] });
      },
    }
  );
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string, { previous?: string }>(
    async (postId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.unlikePost(postId);
    },
    {
      onMutate: async (postId: string) => {
        await queryClient.cancelQueries({ queryKey: ["postLikes", postId] });
        const previous = queryClient.getQueryData<string>(["postLikes", postId]);
        const prevBig = BigInt(previous ?? "0");
        const next = prevBig > 0n ? (prevBig - 1n) : 0n;
        queryClient.setQueryData(["postLikes", postId], next.toString());
        return { previous };
      },
      onError: (err, postId, context) => {
        if (context?.previous) {
          queryClient.setQueryData(["postLikes", postId], context.previous);
        }
        // console.error(err);
      },
      onSettled: (_data, _err, postId) => {
        void queryClient.invalidateQueries({ queryKey: ["postLikes", postId] });
      },
    }
  );
}

// ─── Live Streams ─────────────────────────────────────────────────────────

export function useListActiveLiveStreams() {
  const { actor, isFetching } = useActor();
  return useQuery<LiveStream[], Error>({
    queryKey: ["liveStreams"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveLiveStreams();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15_000,
  });
}

export function useJoinStream() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.joinStream(id);
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["liveStreams"] });
      },
    }
  );
}

// ─── NFT Marketplace ───────────────────────────────────────────────────────

export function useListAllNFTListings() {
  const { actor, isFetching } = useActor();
  return useQuery<NFT[], Error>({
    queryKey: ["nftListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllNFTListings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5_000,
  });
}

export function useBuyNFT() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.buyNFTListing(id);
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["nftListings"] });
      },
    }
  );
}

// ─── Chat ─────────────────────────────────────────────────────────────────

export function useGetAllConversations() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[], Error>({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllConversations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5_000,
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null, Error>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5_000,
  });
}

export function useGetUserStats(principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<UserStats | null, Error>({
    queryKey: ["userStats", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import("@icp-sdk/core/principal");
      const raw = await actor.getUserStats(Principal.fromText(principal));
      return stringifyUserStats(raw);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 5_000,
  });
}

export function useGetTotalEarnings(principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string, Error>({
    queryKey: ["totalEarnings", principal],
    queryFn: async () => {
      if (!actor || !principal) return "0";
      const { Principal } = await import("@icp-sdk/core/principal");
      const result = await actor.getTotalEarnings(Principal.fromText(principal));
      return safeBigIntToString(result);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 5_000,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { username: string; bio: string; avatarUrl: string }>(
    async ({ username, bio, avatarUrl }) => {
      if (!actor) throw new Error("Not connected");
      await actor.createProfile(username, bio, avatarUrl);
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      },
    }
  );
}
