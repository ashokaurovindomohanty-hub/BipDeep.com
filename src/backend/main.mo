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
    source : {
      #ad;
      #nft;
      #tip;
    };
    timestamp : Time.Time;
  };

  module Earning {
    public func compare(a : Earning, b : Earning) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Text, Post>();
  let comments = Map.empty<Text, Comment>();
  let liveStreams = Map.empty<Text, LiveStream>();
  let nfts = Map.empty<Text, NFT>();
  let messages = Map.empty<Principal, List.List<Message>>();
  let earnings = Map.empty<Principal, List.List<Earning>>();
  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let following = Map.empty<Principal, Set.Set<Principal>>();
  let postLikes = Map.empty<Text, Set.Set<Principal>>();
  var commentCounter : Nat = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User management
  public shared ({ caller }) func createProfile(username : Text, bio : Text, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    let profile : UserProfile = {
      username;
      bio;
      avatarUrl;
      createdAt = Time.now();
    };

    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateProfile(username : Text, bio : Text, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
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

  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == target) {
      Runtime.trap("Cannot follow yourself");
    };

    let currentFollowers = switch (followers.get(target)) {
      case (null) { Set.singleton(caller) };
      case (?existing) {
        existing.add(caller);
        existing;
      };
    };
    followers.add(target, currentFollowers);

    let currentFollowing = switch (following.get(caller)) {
      case (null) { Set.singleton(target) };
      case (?existing) {
        existing.add(target);
        existing;
      };
    };
    following.add(caller, currentFollowing);
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    switch (followers.get(target)) {
      case (null) { Runtime.trap("Not following this user") };
      case (?existing) {
        existing.remove(caller);
        followers.add(target, existing);
      };
    };

    switch (following.get(caller)) {
      case (null) { Runtime.trap("No following record found") };
      case (?existing) {
        existing.remove(target);
        following.add(caller, existing);
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

    let userPosts = posts.values().toArray().filter(func(p) { p.author == user });
    let totalPosts = userPosts.size();

    {
      followerCount;
      followingCount;
      totalPosts;
    };
  };

  // Posts/Videos
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
  };

  public query ({ caller }) func getPost(id : Text) : async ?Post {
    posts.get(id);
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.values().toArray();
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    posts.values().toArray().filter(func(p) { p.author == user });
  };

  public shared ({ caller }) func likePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    let currentLikes = switch (postLikes.get(postId)) {
      case (null) { Set.singleton(caller) };
      case (?existing) {
        existing.add(caller);
        existing;
      };
    };
    postLikes.add(postId, currentLikes);
  };

  public shared ({ caller }) func unlikePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    switch (postLikes.get(postId)) {
      case (null) { Runtime.trap("No likes found for this post") };
      case (?existing) {
        existing.remove(caller);
        postLikes.add(postId, existing);
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

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?_) {
        commentCounter += 1;
        let commentId = postId.concat("-".concat(commentCounter.toText()));
        let comment : Comment = {
          id = commentId;
          postId;
          author = caller;
          content;
          createdAt = Time.now();
        };
        comments.add(commentId, comment);
      };
    };
  };

  public query ({ caller }) func getCommentsForPost(postId : Text) : async [Comment] {
    comments.values().toArray().filter(func(c) { c.postId == postId });
  };

  // Live streams
  public shared ({ caller }) func createLiveStream(
    id : Text,
    title : Text,
    description : Text,
    thumbnailUrl : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create live streams");
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

  // NFT Marketplace
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

  // Chat messages
  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let message : Message = {
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
      isRead = false;
    };

    let recipientMessages = switch (messages.get(recipient)) {
      case (null) { List.singleton<Message>(message) };
      case (?existing) {
        existing.add(message);
        existing;
      };
    };
    messages.add(recipient, recipientMessages);

    let senderMessages = switch (messages.get(caller)) {
      case (null) { List.singleton<Message>(message) };
      case (?existing) {
        existing.add(message);
        existing;
      };
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
        msgs.toArray().filter(func(m) {
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
      case (?msgs) { msgs.toArray() };
    };
  };

  public shared ({ caller }) func markMessagesAsRead(withUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark messages as read");
    };

    switch (messages.get(caller)) {
      case (null) { };
      case (?msgs) {
        let updatedMessages = msgs.map<Message, Message>(
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

  // Creator earnings
  public shared ({ caller }) func recordEarning(user : Principal, amount : Nat, source : { #ad; #nft; #tip }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record earnings");
    };

    let earning : Earning = {
      user;
      amount;
      source;
      timestamp = Time.now();
    };

    let userEarnings = switch (earnings.get(user)) {
      case (null) { List.singleton<Earning>(earning) };
      case (?existing) {
        existing.add(earning);
        existing;
      };
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
        for (earning in userEarnings.values()) {
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
        userEarnings.toArray().sort();
      };
    };
  };
};
