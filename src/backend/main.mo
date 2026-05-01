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

  // Primary data stores
  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Text, Post>();
  let comments = Map.empty<Text, Comment>();
  let liveStreams = Map.empty<Text, LiveStream>();
  let nfts = Map.empty<Text, NFT>();
  let messages = Map.empty<Principal, List.List<Message>>();
  let earnings = Map.empty<Principal, List.List<Earning>>();

  // Social graph storage
  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let following = Map.empty<Principal, Set.Set<Principal>>();

  // Engagement storage
  let postLikes = Map.empty<Text, Set.Set<Principal>>();

  // Index for performance optimization
  let userPostsIndex = Map.empty<Principal, [Text]>();
  let userNFTsIndex = Map.empty<Principal, [Text]>();
  let postCommentsIndex = Map.empty<Text, [Text]>();

  var commentCounter : Nat = 0;

  // Access control state
  let accessControlState = AccessControl.initState();
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
  stable var stableCommentCounter : Nat = 0;

  system func preupgrade() {
    stableUserProfiles := Iter.toArray(userProfiles.entries());
    stablePosts := Iter.toArray(posts.entries());
    stableComments := Iter.toArray(comments.entries());
    stableLiveStreams := Iter.toArray(liveStreams.entries());
    stableNFTs := Iter.toArray(nfts.entries());
    stableFollowers := Array.map<(Principal, Set.Set<Principal>), (Principal, [Principal])>(
      Iter.toArray(followers.entries()),
      func((k, v)) { (k, v.toArray()) }
    );
    stableFollowing := Array.map<(Principal, Set.Set<Principal>), (Principal, [Principal])>(
      Iter.toArray(following.entries()),
      func((k, v)) { (k, v.toArray()) }
    );
    stablePostLikes := Array.map<(Text, Set.Set<Principal>), (Text, [Principal])>(
      Iter.toArray(postLikes.entries()),
      func((k, v)) { (k, v.toArray()) }
    );
    stableUserPostsIndex := Iter.toArray(userPostsIndex.entries());
    stableUserNFTsIndex := Iter.toArray(userNFTsIndex.entries());
    stableCommentCounter := commentCounter;
  };

  system func postupgrade() {
    for ((k, v) in stableUserProfiles.vals()) { userProfiles.add(k, v) };
    for ((k, v) in stablePosts.vals()) { posts.add(k, v) };
    for ((k, v) in stableComments.vals()) { comments.add(k, v) };
    for ((k, v) in stableLiveStreams.vals()) { liveStreams.add(k, v) };
    for ((k, v) in stableNFTs.vals()) { nfts.add(k, v) };
    for ((k, v) in stableFollowers.vals()) {
      var set = Set.empty<Principal>();
      for (p in v.vals()) { set := set.add(p) };
      followers.add(k, set);
    };
    for ((k, v) in stableFollowing.vals()) {
      var set = Set.empty<Principal>();
      for (p in v.vals()) { set := set.add(p) };
      following.add(k, set);
    };
    for ((k, v) in stablePostLikes.vals()) {
      var set = Set.empty<Principal>();
      for (p in v.vals()) { set := set.add(p) };
      postLikes.add(k, set);
    };
    for ((k, v) in stableUserPostsIndex.vals()) { userPostsIndex.add(k, v) };
    for ((k, v) in stableUserNFTsIndex.vals()) { userNFTsIndex.add(k, v) };
    commentCounter := stableCommentCounter;
  };

  // ============ Profile Management ============
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or admin access required");
    };
    userProfiles.get(user);
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?UserProfile {
    // Public profile view - respects user privacy settings if implemented
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (not validateUsername(profile.username)) {
      Runtime.trap("Invalid username: must be 1-50 characters");
    };
    if (not validateBio(profile.bio)) {
      Runtime.trap("Invalid bio: must be under 500 characters");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createProfile(username : Text, bio : Text, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };
    if (not validateUsername(username)) {
      Runtime.trap("Invalid username: must be 1-50 characters");
    };
    if (not validateBio(bio)) {
      Runtime.trap("Invalid bio: must be under 500 characters");
    };

    let profile : UserProfile = {
      username;
      bio;
      avatarUrl;
      createdAt = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateProfile(username : Text, bio : Text, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    if (not validateUsername(username)) {
      Runtime.trap("Invalid username: must be 1-50 characters");
    };
    if (not validateBio(bio)) {
      Runtime.trap("Invalid bio: must be under 500 characters");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?existingProfile) {
        let updatedProfile : UserProfile = {
          username;
          bio;
          avatarUrl;
          createdAt = existingProfile.createdAt;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // ============ Social Graph Management ============
  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == target) {
      Runtime.trap("Cannot follow yourself");
    };
    if (userProfiles.get(target) == null) {
      Runtime.trap("Target user does not exist");
    };

    // Update followers set for target
    let newFollowers = switch (followers.get(target)) {
      case (null) { Set.singleton(caller) };
      case (?existing) { 
        var newSet = Set.empty<Principal>();
        for (follower in existing.values()) {
          newSet := newSet.add(follower);
        };
        newSet.add(caller);
      };
    };
    followers.add(target, newFollowers);

    // Update following set for caller
    let newFollowing = switch (following.get(caller)) {
      case (null) { Set.singleton(target) };
      case (?existing) { 
        var newSet = Set.empty<Principal>();
        for (followee in existing.values()) {
          newSet := newSet.add(followee);
        };
        newSet.add(target);
      };
    };
    following.add(caller, newFollowing);
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    switch (followers.get(target)) {
      case (null) { Runtime.trap("Not following this user") };
      case (?existing) {
        var newSet = Set.empty<Principal>();
        for (follower in existing.values()) {
          if (follower != caller) {
            newSet := newSet.add(follower);
          };
        };
        followers.add(target, newSet);
      };
    };

    switch (following.get(caller)) {
      case (null) { Runtime.trap("No following record found") };
      case (?existing) {
        var newSet = Set.empty<Principal>();
        for (followee in existing.values()) {
          if (followee != target) {
            newSet := newSet.add(followee);
          };
        };
        following.add(caller, newSet);
      };
    };
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    switch (followers.get(user)) {
      case (null) { [] };
      case (?followerSet) { followerSet.toArray() };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    switch (following.get(user)) {
      case (null) { [] };
      case (?followingSet) { followingSet.toArray() };
    };
  };

  public query ({ caller }) func getUserStats(user : Principal) : async {
    followerCount : Nat;
    followingCount : Nat;
    totalPosts : Nat;
  } {
    let followerCount = switch (followers.get(user)) {
      case (null) { 0 };
      case (?followerSet) { followerSet.size() };
    };

    let followingCount = switch (following.get(user)) {
      case (null) { 0 };
      case (?followingSet) { followingSet.size() };
    };

    let totalPosts = switch (userPostsIndex.get(user)) {
      case (null) { 0 };
      case (?postIds) { postIds.size() };
    };

    { followerCount; followingCount; totalPosts };
  };

  // ============ Posts/Videos Management ============
  public shared ({ caller }) func createPost(
    id : Text,
    title : Text,
    description : Text,
    videoUrl : Text,
    thumbnailUrl : Text,
    duration : Nat,
    tags : [Text]
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    if (posts.get(id) != null) {
      Runtime.trap("Post with this ID already exists");
    };
    if (not validatePostTitle(title)) {
      Runtime.trap("Invalid title: must be 1-200 characters");
    };
    if (not validatePostDescription(description)) {
      Runtime.trap("Invalid description: must be 1-5000 characters");
    };

    let post : Post = {
      id;
      author = caller;
      title;
      description;
      videoUrl;
      thumbnailUrl;
      duration;
      tags;
      createdAt = Time.now();
    };

    posts.add(id, post);

    // Update user posts index
    let updatedPostIds = switch (userPostsIndex.get(caller)) {
      case (null) { [id] };
      case (?existing) { Array.append(existing, [id]) };
    };
    userPostsIndex.add(caller, updatedPostIds);
  };

  public query ({ caller }) func getPost(id : Text) : async ?Post {
    posts.get(id);
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.values().toArray();
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    switch (userPostsIndex.get(user)) {
      case (null) { [] };
      case (?postIds) {
        Array.mapFilter<Text, Post>(
          postIds,
          func(id) { posts.get(id) }
        );
      };
    };
  };

  public shared ({ caller }) func likePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    if (posts.get(postId) == null) {
      Runtime.trap("Post not found");
    };

    let newLikes = switch (postLikes.get(postId)) {
      case (null) { Set.singleton(caller) };
      case (?existing) { 
        var newSet = Set.empty<Principal>();
        for (liker in existing.values()) {
          newSet := newSet.add(liker);
        };
        newSet.add(caller);
      };
    };
    postLikes.add(postId, newLikes);
  };

  public shared ({ caller }) func unlikePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    switch (postLikes.get(postId)) {
      case (null) { Runtime.trap("No likes found for this post") };
      case (?existing) {
        var newSet = Set.empty<Principal>();
        for (liker in existing.values()) {
          if (liker != caller) {
            newSet := newSet.add(liker);
          };
        };
        postLikes.add(postId, newSet);
      };
    };
  };

  public query ({ caller }) func getPostLikesCount(postId : Text) : async Nat {
    switch (postLikes.get(postId)) {
      case (null) { 0 };
      case (?likes) { likes.size() };
    };
  };

  public shared ({ caller }) func addComment(postId : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    if (not validateCommentContent(content)) {
      Runtime.trap("Invalid comment: must be 1-1000 characters");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?_) {
        commentCounter += 1;
        let commentId = generateCommentId(postId, commentCounter);
        let comment : Comment = {
          id = commentId;
          postId;
          author = caller;
          content;
          createdAt = Time.now();
        };
        comments.add(commentId, comment);

        // Update post comments index
        let updatedCommentIds = switch (postCommentsIndex.get(postId)) {
          case (null) { [commentId] };
          case (?existing) { Array.append(existing, [commentId]) };
        };
        postCommentsIndex.add(postId, updatedCommentIds);
      };
    };
  };

  public query ({ caller }) func getCommentsForPost(postId : Text) : async [Comment] {
    switch (postCommentsIndex.get(postId)) {
      case (null) { [] };
      case (?commentIds) {
        Array.mapFilter<Text, Comment>(
          commentIds,
          func(id) { comments.get(id) }
        );
      };
    };
  };

  // ============ Live Streams Management ============
  public shared ({ caller }) func createLiveStream(
    id : Text,
    title : Text,
    description : Text,
    thumbnailUrl : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create live streams");
    };
    if (liveStreams.get(id) != null) {
      Runtime.trap("Live stream with this ID already exists");
    };

    let stream : LiveStream = {
      id;
      host = caller;
      title;
      description;
      thumbnailUrl;
      isActive = true;
      viewers = 0;
      startedAt = Time.now();
    };
    liveStreams.add(id, stream);
  };

  public shared ({ caller }) func endLiveStream(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end live streams");
    };

    switch (liveStreams.get(id)) {
      case (null) { Runtime.trap("Live stream not found") };
      case (?stream) {
        if (stream.host != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the host or admin can end this stream");
        };
        let updatedStream : LiveStream = {
          id = stream.id;
          host = stream.host;
          title = stream.title;
          description = stream.description;
          thumbnailUrl = stream.thumbnailUrl;
          isActive = false;
          viewers = stream.viewers;
          startedAt = stream.startedAt;
        };
        liveStreams.add(id, updatedStream);
      };
    };
  };

  public query ({ caller }) func listActiveLiveStreams() : async [LiveStream] {
    liveStreams.values().toArray().filter(func(s) { s.isActive });
  };

  public shared ({ caller }) func joinStream(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can join streams");
    };

    switch (liveStreams.get(id)) {
      case (null) { Runtime.trap("Live stream not found") };
      case (?stream) {
        if (not stream.isActive) {
          Runtime.trap("Stream is not active");
        };
        let updatedStream : LiveStream = {
          id = stream.id;
          host = stream.host;
          title = stream.title;
          description = stream.description;
          thumbnailUrl = stream.thumbnailUrl;
          isActive = stream.isActive;
          viewers = stream.viewers + 1;
          startedAt = stream.startedAt;
        };
        liveStreams.add(id, updatedStream);
      };
    };
  };

  public shared ({ caller }) func leaveStream(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can leave streams");
    };

    switch (liveStreams.get(id)) {
      case (null) { Runtime.trap("Live stream not found") };
      case (?stream) {
        let newViewers = if (stream.viewers > 0) { stream.viewers - 1 } else { 0 };
        let updatedStream : LiveStream = {
          id = stream.id;
          host = stream.host;
          title = stream.title;
          description = stream.description;
          thumbnailUrl = stream.thumbnailUrl;
          isActive = stream.isActive;
          viewers = newViewers;
          startedAt = stream.startedAt;
        };
        liveStreams.add(id, updatedStream);
      };
    };
  };

  public query ({ caller }) func getStreamById(id : Text) : async ?LiveStream {
    liveStreams.get(id);
  };

  // ============ NFT Marketplace ============
  public shared ({ caller }) func createNFTListing(
    id : Text,
    title : Text,
    description : Text,
    imageUrl : Text,
    price : Nat
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create NFT listings");
    };
    if (nfts.get(id) != null) {
      Runtime.trap("NFT with this ID already exists");
    };
    if (price == 0) {
      Runtime.trap("NFT price must be greater than 0");
    };

    let nft : NFT = {
      id;
      creator = caller;
      owner = caller;
      title;
      description;
      imageUrl;
      price;
      isSold = false;
      createdAt = Time.now();
    };
    nfts.add(id, nft);

    // Update user NFTs index
    let updatedNFTIds = switch (userNFTsIndex.get(caller)) {
      case (null) { [id] };
      case (?existing) { Array.append(existing, [id]) };
    };
    userNFTsIndex.add(caller, updatedNFTIds);
  };

  public shared ({ caller }) func buyNFTListing(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can buy NFTs");
    };

    switch (nfts.get(id)) {
      case (null) { Runtime.trap("NFT not found") };
      case (?nft) {
        if (nft.isSold) {
          Runtime.trap("NFT already sold");
        };
        if (nft.owner == caller) {
          Runtime.trap("Cannot buy your own NFT");
        };

        // TODO: Implement payment verification via ICP ledger
        let updatedNFT : NFT = {
          id = nft.id;
          creator = nft.creator;
          owner = caller;
          title = nft.title;
          description = nft.description;
          imageUrl = nft.imageUrl;
          price = nft.price;
          isSold = true;
          createdAt = nft.createdAt;
        };
        nfts.add(id, updatedNFT);

        // Update NFT index for new owner
        let updatedNFTIds = switch (userNFTsIndex.get(caller)) {
          case (null) { [id] };
          case (?existing) { Array.append(existing, [id]) };
        };
        userNFTsIndex.add(caller, updatedNFTIds);
      };
    };
  };

  public query ({ caller }) func getNFTById(id : Text) : async ?NFT {
    nfts.get(id);
  };

  public query ({ caller }) func listAllNFTListings() : async [NFT] {
    nfts.values().toArray();
  };

  public query ({ caller }) func listNFTsByCreator(creator : Principal) : async [NFT] {
    nfts.values().toArray().filter(func(n) { n.creator == creator });
  };

  public query ({ caller }) func listNFTsByOwner(owner : Principal) : async [NFT] {
    switch (userNFTsIndex.get(owner)) {
      case (null) { [] };
      case (?nftIds) {
        Array.mapFilter<Text, NFT>(
          nftIds,
          func(id) { nfts.get(id) }
        );
      };
    };
  };

  public shared ({ caller }) func markNFTAsSold(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark NFTs as sold");
    };

    switch (nfts.get(id)) {
      case (null) { Runtime.trap("NFT not found") };
      case (?nft) {
        let updatedNFT : NFT = {
          id = nft.id;
          creator = nft.creator;
          owner = nft.owner;
          title = nft.title;
          description = nft.description;
          imageUrl = nft.imageUrl;
          price = nft.price;
          isSold = true;
          createdAt = nft.createdAt;
        };
        nfts.add(id, updatedNFT);
      };
    };
  };

  // ============ Chat Messages ============
  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    if (userProfiles.get(recipient) == null) {
      Runtime.trap("Recipient user does not exist");
    };
    if (Text.size(content) == 0 or Text.size(content) > 5000) {
      Runtime.trap("Message content must be 1-5000 characters");
    };

    let message : Message = {
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      isRead = false;
    };

    // Store in recipient's messages
    let recipientMessages = switch (messages.get(recipient)) {
      case (null) { List.singleton<Message>(message) };
      case (?existing) { List.push(message, existing) };
    };
    messages.add(recipient, recipientMessages);

    // Store in sender's messages
    let senderMessages = switch (messages.get(caller)) {
      case (null) { List.singleton<Message>(message) };
      case (?existing) { List.push(message, existing) };
    };
    messages.add(caller, senderMessages);
  };

  public query ({ caller }) func getConversation(withUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    switch (messages.get(caller)) {
      case (null) { [] };
      case (?msgs) {
        List.toArray(msgs).filter(func(m) {
          (m.sender == caller and m.recipient == withUser) or
          (m.sender == withUser and m.recipient == caller)
        });
      };
    };
  };

  public query ({ caller }) func getAllConversations() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    switch (messages.get(caller)) {
      case (null) { [] };
      case (?msgs) { List.toArray(msgs) };
    };
  };

  public shared ({ caller }) func markMessagesAsRead(withUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    switch (messages.get(caller)) {
      case (null) { };
      case (?msgs) {
        let updatedMessages = List.map<Message, Message>(
          msgs,
          func(m) {
            if (m.sender == withUser and m.recipient == caller and not m.isRead) {
              {
                sender = m.sender;
                recipient = m.recipient;
                content = m.content;
                timestamp = m.timestamp;
                isRead = true;
              };
            } else {
              m;
            };
          }
        );
        messages.add(caller, updatedMessages);
      };
    };
  };

  // ============ Creator Earnings ============
  public shared ({ caller }) func recordEarning(user : Principal, amount : Nat, source : { #ad; #nft; #tip }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record earnings");
    };
    if (amount == 0) {
      Runtime.trap("Earning amount must be greater than 0");
    };

    let earning : Earning = {
      user;
      amount;
      source;
      timestamp = Time.now();
    };

    let userEarnings = switch (earnings.get(user)) {
      case (null) { List.singleton<Earning>(earning) };
      case (?existing) { List.push(earning, existing) };
    };
    earnings.add(user, userEarnings);
  };

  public query ({ caller }) func getTotalEarnings(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own earnings");
    };

    var total = 0;
    switch (earnings.get(user)) {
      case (null) { 0 };
      case (?userEarnings) {
        for (earning in List.toArray(userEarnings).vals()) {
          total += earning.amount;
        };
        total;
      };
    };
  };

  public query ({ caller }) func getEarningsHistory(user : Principal) : async [Earning] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own earnings history");
    };

    switch (earnings.get(user)) {
      case (null) { [] };
      case (?userEarnings) {
        let earningsArray = List.toArray(userEarnings);
        Array.sortInPlace<Earning>(
          earningsArray,
          func(a : Earning, b : Earning) {
            Int.compare(a.timestamp, b.timestamp);
          }
        );
        earningsArray;
      };
    };
  };

  public query ({ caller }) func getEarningsBySource(user : Principal, source : { #ad; #nft; #tip }) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own earnings");
    };

    var total = 0;
    switch (earnings.get(user)) {
      case (null) { 0 };
      case (?userEarnings) {
        for (earning in List.toArray(userEarnings).vals()) {
          if (earning.source == source) {
            total += earning.amount;
          };
        };
        total;
      };
    };
  };
};
