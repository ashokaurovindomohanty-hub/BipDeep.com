import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LiveStream {
    id: string;
    title: string;
    startedAt: Time;
    thumbnailUrl: string;
    host: Principal;
    description: string;
    isActive: boolean;
    viewers: bigint;
}
export type Time = bigint;
export interface Comment {
    id: string;
    content: string;
    createdAt: Time;
    author: Principal;
    postId: string;
}
export interface Post {
    id: string;
    title: string;
    duration: bigint;
    thumbnailUrl: string;
    createdAt: Time;
    tags: Array<string>;
    description: string;
    author: Principal;
    videoUrl: string;
}
export interface Message {
    content: string;
    recipient: Principal;
    isRead: boolean;
    sender: Principal;
    timestamp: Time;
}
export interface Earning {
    source: Variant_ad_nft_tip;
    user: Principal;
    timestamp: Time;
    amount: bigint;
}
export interface NFT {
    id: string;
    title: string;
    creator: Principal;
    owner: Principal;
    createdAt: Time;
    description: string;
    isSold: boolean;
    imageUrl: string;
    price: bigint;
}
export interface UserProfile {
    bio: string;
    username: string;
    createdAt: Time;
    avatarUrl: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_ad_nft_tip {
    ad = "ad",
    nft = "nft",
    tip = "tip"
}
export interface backendInterface {
    addComment(postId: string, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyNFTListing(id: string): Promise<void>;
    createLiveStream(id: string, title: string, description: string, thumbnailUrl: string): Promise<void>;
    createNFTListing(id: string, title: string, description: string, imageUrl: string, price: bigint): Promise<void>;
    createPost(id: string, title: string, description: string, videoUrl: string, thumbnailUrl: string, duration: bigint, tags: Array<string>): Promise<void>;
    createProfile(username: string, bio: string, avatarUrl: string): Promise<void>;
    endLiveStream(id: string): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getAllConversations(): Promise<Array<Message>>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsForPost(postId: string): Promise<Array<Comment>>;
    getConversation(withUser: Principal): Promise<Array<Message>>;
    getEarningsHistory(user: Principal): Promise<Array<Earning>>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getNFTById(id: string): Promise<NFT | null>;
    getPost(id: string): Promise<Post | null>;
    getPostLikesCount(postId: string): Promise<bigint>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getProfile(user: Principal): Promise<UserProfile | null>;
    getStreamById(id: string): Promise<LiveStream | null>;
    getTotalEarnings(user: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(user: Principal): Promise<{
        followerCount: bigint;
        followingCount: bigint;
        totalPosts: bigint;
    }>;
    isCallerAdmin(): Promise<boolean>;
    joinStream(id: string): Promise<void>;
    leaveStream(id: string): Promise<void>;
    likePost(postId: string): Promise<void>;
    listActiveLiveStreams(): Promise<Array<LiveStream>>;
    listAllNFTListings(): Promise<Array<NFT>>;
    listNFTsByCreator(creator: Principal): Promise<Array<NFT>>;
    markMessagesAsRead(withUser: Principal): Promise<void>;
    markNFTAsSold(id: string): Promise<void>;
    recordEarning(user: Principal, amount: bigint, source: Variant_ad_nft_tip): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(recipient: Principal, content: string): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
    unlikePost(postId: string): Promise<void>;
    updateProfile(username: string, bio: string, avatarUrl: string): Promise<void>;
}
