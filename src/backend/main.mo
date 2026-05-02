import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // ============ Type Definitions ============
  public type UserProfile = {
    username : Text;
    bio : Text;
    avatarUrl : Text;
    createdAt : Time.Time;
  };

  public type Post = {
    id : Text;
    author : Principal;
    title : Text;
    description : Text;
    videoUrl : Text;
    thumbnailUrl : Text;
    duration : Nat;
    tags : [Text];
    createdAt : Time.Time;
  };

  public type Comment = {
    id : Text;
    postId : Text;
    author : Principal;
    content : Text;
    createdAt : Time.Time;
  };

  public type LiveStream = {
    id : Text;
    host : Principal;
    title : Text;
    description : Text;
    thumbnailUrl : Text;
    isActive : Bool;
    viewers : Nat;
    startedAt : Time.Time;
  };

  public type NFT = {
    id : Text;
    creator : Principal;
    owner : Principal;
    title : Text;
    description : Text;
    imageUrl : Text;
    price : Nat;
    isSold : Bool;
    createdAt : Time.Time;
  };

  public type Message = {
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
    isRead : Bool;
  };

  public type Earning = {
    user : Principal;
    amount : Nat;
    source : { #ad; #nft; #tip };
    timestamp : Time.Time;
  };

  // Result type for better error handling
  public type Result<T, E> = {
    #ok : T;
    #err : E;
  };

  // ============ Utility Functions ============
  module Earning {
    public func compare(a : Earning, b : Earning) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  // Input validation helpers
  private func validateUsername(username : Text) : Bool {
    let length = Text.size(username);
    length > 0 and length <= 50;
  };

  private func validateBio(bio : Text) : Bool {
    Text.size(bio) <= 500;
  };

  private func validatePostTitle(title : Text) : Bool {
    let length = Text.size(title);
    length > 0 and length <= 200;
  };

  private func validatePostDescription(desc : Text) : Bool {
    let length = Text.size(desc);
    length > 0 and length <= 5000;
  };

  private func validateCommentContent(content : Text) : Bool {
    let length = Text.size(content);
    length > 0 and length <= 1000;
  };

  // ID generation helper
  private func generateCommentId(postId : Text, counter : Nat) : Text {
    postId # "#" # Nat.toText(counter) # "#" # Nat.toText(Time.now());
  };

  // ============ Storage & Initialization ============
  include MixinStorage();

  // Primary data stores (MUST BE var, not let)
  var userProfiles = Map.empty<Principal, UserProfile>();
  var posts = Map.empty<Text, Post>();
  var comments = Map.empty<Text, Comment>();
  var liveStreams = Map.empty<Text, LiveStream>();
  var nfts = Map.empty<Text, NFT>();
  var messages = Map.empty<Principal, List.List<Message>>();
  var earnings = Map.empty<Principal, List.List<Earning>>();

  // Social graph storage
  var followers = Map.empty<Principal, Set.Set<Principal>>();
  var following = Map.empty<Principal, Set.Set<Principal>>();

  // Engagement storage
  var postLikes = Map.empty<Text, Set.Set<Principal>>();

  // Index for performance optimization
  var userPostsIndex = Map.empty<Principal, [Text]>();
  var userNFTsIndex = Map.empty<Principal, [Text]>();
  var postCommentsIndex = Map.empty<Text, [Text]>();

  var commentCounter : Nat = 0;

  // Access control state (needs to be var!)
  var accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ============ Stable Storage for Upgrades ============
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stablePosts : [(Text, Post)] = [];
  stable var stableComments : [(Text, Comment)] = [];
  stable var stableLiveStreams : [(Text, LiveStream)] = [];
  stable var stableNFTs : [(Text, NFT)] = [];
  stable var stableFollowers : [(Principal, [Principal])] = [];
  stable var stableFollowing : [(Principal, [Principal])] = [];
  stable var stablePostLikes : [(Text, [Principal])] = [];
  stable var stableUserPostsIndex : [(Principal, [Text])] = [];
  stable var stableUserNFTsIndex : [(Principal, [Text])] = [];
  stable var stablePostCommentsIndex : [(Text, [Text])] = [];
  stable var stableCommentCounter : Nat = 0;

  system func preupgrade() {
    stableUserProfiles := Iter.toArray(userProfiles.entries());
    stablePosts := Iter.toArray(posts.entries());
    stableComments := Iter.toArray(comments.entries());
    stableLiveStreams := Iter.toArray(liveStreams.entries());
    stableNFTs := Iter.toArray(nfts.entries());
    stableFollowers := Array.map(
      Iter.toArray(followers.entries()),
      func((k, v)) { (k, v.toArray()) }
    );
    stableFollowing := Array.map(
      Iter.toArray(following.entries()),
      func((k, v)) { (k, v.toArray()) }
    );
    stablePostLikes := Array.map(
      Iter.toArray(postLikes.entries()),
      func((k, v)) { (k, v.toArray()) }
    );
    stableUserPostsIndex := Iter.toArray(userPostsIndex.entries());
    stableUserNFTsIndex := Iter.toArray(userNFTsIndex.entries());
    stablePostCommentsIndex := Iter.toArray(postCommentsIndex.entries());
    stableCommentCounter := commentCounter;
  };

  system func postupgrade() {
    for ((k, v) in stableUserProfiles.vals()) { userProfiles.put(k, v) };
    for ((k, v) in stablePosts.vals()) { posts.put(k, v) };
    for ((k, v) in stableComments.vals()) { comments.put(k, v) };
    for ((k, v) in stableLiveStreams.vals()) { liveStreams.put(k, v) };
    for ((k, v) in stableNFTs.vals()) { nfts.put(k, v) };
    for ((k, v) in stableFollowers.vals()) {
      var set = Set.empty<Principal>();
      for (p in v.vals()) { set := set.add(p) };
      followers.put(k, set);
    };
    for ((k, v) in stableFollowing.vals()) {
      var set = Set.empty<Principal>();
      for (p in v.vals()) { set := set.add(p) };
      following.put(k, set);
    };
    for ((k, v) in stablePostLikes.vals()) {
      var set = Set.empty<Principal>();
      for (p in v.vals()) { set := set.add(p) };
      postLikes.put(k, set);
    };
    for ((k, v) in stableUserPostsIndex.vals()) { userPostsIndex.put(k, v) };
    for ((k, v) in stableUserNFTsIndex.vals()) { userNFTsIndex.put(k, v) };
    for ((k, v) in stablePostCommentsIndex.vals()) { postCommentsIndex.put(k, v) };
    commentCounter := stableCommentCounter;
  };

  // ... (All your public/shared/query methods below remain the same logic as you wrote, but now work on var collections)

}; // End actor
