import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Posts / Feed ────────────────────────────────────────────────────────────

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPostLikesCount(postId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["postLikes", postId],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getPostLikesCount(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useGetCommentsForPost(postId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsForPost(postId);
    },
    enabled: !!actor && !isFetching && !!postId,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.likePost(postId);
    },
    onSuccess: (_, postId) => {
      void queryClient.invalidateQueries({ queryKey: ["postLikes", postId] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.unlikePost(postId);
    },
    onSuccess: (_, postId) => {
      void queryClient.invalidateQueries({ queryKey: ["postLikes", postId] });
    },
  });
}

// ─── Live Streams ────────────────────────────────────────────────────────────

export function useListActiveLiveStreams() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["liveStreams"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listActiveLiveStreams();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useJoinStream() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.joinStream(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["liveStreams"] });
    },
  });
}

// ─── NFT Marketplace ─────────────────────────────────────────────────────────

export function useListAllNFTListings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["nftListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllNFTListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBuyNFT() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.buyNFTListing(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["nftListings"] });
    },
  });
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export function useGetAllConversations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllConversations();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserStats(principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userStats", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getUserStats(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useGetTotalEarnings(principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["totalEarnings", principal],
    queryFn: async () => {
      if (!actor || !principal) return BigInt(0);
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.getTotalEarnings(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      bio,
      avatarUrl,
    }: {
      username: string;
      bio: string;
      avatarUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProfile(username, bio, avatarUrl);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}
