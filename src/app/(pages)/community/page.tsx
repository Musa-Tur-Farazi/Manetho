"use client";

import { useState } from "react";
import { Search, Star, MessageCircle, User, ThumbsUp, Clock, Filter } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import PageHeader from "../../../../components/ui/PageHeader";
import ContentCard from "../../../../components/ui/ContentCard";
import { useUser } from "@clerk/nextjs";

export default function CommunityPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const categories = [
    "All",
    "Study Tips",
    "Questions",
    "Resources",
    "Study Groups",
    "Success Stories",
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  // Sample data for community posts
  const [communityPosts, setCommunityPosts] = useState([
    {
      id: 1,
      title: "How I organized my study schedule for finals",
      content: "I've been struggling with time management for my finals, but I found a system that works for me. I use the Pomodoro technique (25 min work, 5 min break) and create detailed daily schedules. It's increased my productivity by at least 30%!",
      category: "Study Tips",
      author: "Emma Johnson",
      authorImage: "https://i.pravatar.cc/150?img=1",
      date: "June 15, 2024",
      timeAgo: "2 hours ago",
      stars: 24,
      comments: 8,
      userStarred: false,
      commentsList: [
        {
          id: 101,
          author: "Alex Chen",
          authorImage: "https://i.pravatar.cc/150?img=2",
          content: "This is exactly what I needed! I'm going to try this approach for my upcoming exams.",
          timeAgo: "1 hour ago",
          likes: 5
        },
        {
          id: 102,
          author: "Sarah Wilson",
          authorImage: "https://i.pravatar.cc/150?img=3",
          content: "Do you use any specific app for the Pomodoro technique?",
          timeAgo: "45 minutes ago",
          likes: 2
        }
      ]
    },
    {
      id: 2,
      title: "Looking for study partners for Organic Chemistry",
      content: "Hey everyone! I'm taking Organic Chemistry this semester and would love to form a study group. I find that discussing complex concepts with others helps me understand them better. Anyone interested in joining?",
      category: "Study Groups",
      author: "Michael Torres",
      authorImage: "https://i.pravatar.cc/150?img=4",
      date: "June 14, 2024",
      timeAgo: "1 day ago",
      stars: 15,
      comments: 12,
      userStarred: false,
      commentsList: [
        {
          id: 201,
          author: "Lisa Park",
          authorImage: "https://i.pravatar.cc/150?img=5",
          content: "I'm interested! I'm also taking Organic Chem and could use some study partners.",
          timeAgo: "20 hours ago",
          likes: 3
        }
      ]
    },
    {
      id: 3,
      title: "Free programming resources that helped me learn Python",
      content: "After struggling to learn Python on my own, I found these amazing free resources that made a huge difference: Codecademy, freeCodeCamp, and the 'Automate the Boring Stuff' book. I've gone from complete beginner to being able to build my own projects in just 3 months!",
      category: "Resources",
      author: "David Kim",
      authorImage: "https://i.pravatar.cc/150?img=6",
      date: "June 12, 2024",
      timeAgo: "3 days ago",
      stars: 42,
      comments: 15,
      userStarred: true,
      commentsList: [
        {
          id: 301,
          author: "Priya Sharma",
          authorImage: "https://i.pravatar.cc/150?img=7",
          content: "Thank you for sharing! I've been wanting to learn Python but wasn't sure where to start.",
          timeAgo: "2 days ago",
          likes: 7
        },
        {
          id: 302,
          author: "James Wilson",
          authorImage: "https://i.pravatar.cc/150?img=8",
          content: "I would also recommend 'Python Crash Course' book for beginners!",
          timeAgo: "1 day ago",
          likes: 4
        }
      ]
    },
    {
      id: 4,
      title: "Can someone explain the Krebs Cycle in simple terms?",
      content: "I'm having trouble understanding the Krebs Cycle for my biology class. Can someone explain it in simpler terms? I understand it's something about cellular respiration, but the details are confusing me.",
      category: "Questions",
      author: "Sophia Garcia",
      authorImage: "https://i.pravatar.cc/150?img=9",
      date: "June 10, 2024",
      timeAgo: "5 days ago",
      stars: 18,
      comments: 7,
      userStarred: false,
      commentsList: [
        {
          id: 401,
          author: "Dr. Robert Chen",
          authorImage: "https://i.pravatar.cc/150?img=10",
          content: "Think of the Krebs Cycle as a cellular factory that takes the breakdown products of food and generates energy currency (ATP) along with other important molecules. It's basically a series of chemical reactions that help convert nutrients into energy.",
          timeAgo: "4 days ago",
          likes: 12
        }
      ]
    },
  ]);

  // Filter posts based on search query and active category
  const filteredPosts = communityPosts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort posts based on selected option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === "popular") {
      return b.stars - a.stars;
    } else if (sortBy === "mostComments") {
      return b.comments - a.comments;
    }
    return 0;
  });

  // Handle starring a post
  const handleStarPost = (postId) => {
    setCommunityPosts(communityPosts.map(post => {
      if (post.id === postId) {
        const newStarredStatus = !post.userStarred;
        return {
          ...post,
          userStarred: newStarredStatus,
          stars: newStarredStatus ? post.stars + 1 : post.stars - 1
        };
      }
      return post;
    }));
  };

  // Handle adding a new post
  const handleAddPost = () => {
    if (newPostTitle.trim() === "" || newPostContent.trim() === "") return;

    const newPost = {
      id: communityPosts.length + 1,
      title: newPostTitle,
      content: newPostContent,
      category: activeCategory === "All" ? "Questions" : activeCategory,
      author: user?.fullName || "Anonymous User",
      authorImage: user?.imageUrl || "https://i.pravatar.cc/150?img=12",
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timeAgo: "Just now",
      stars: 0,
      comments: 0,
      userStarred: false,
      commentsList: []
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setNewPostTitle("");
    setNewPostContent("");
    setShowCreatePost(false);
  };

  // Handle adding a comment
  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) return;

    setCommunityPosts(communityPosts.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: Date.now(),
          author: user?.fullName || "Anonymous User",
          authorImage: user?.imageUrl || "https://i.pravatar.cc/150?img=12",
          content: commentText,
          timeAgo: "Just now",
          likes: 0
        };

        return {
          ...post,
          comments: post.comments + 1,
          commentsList: [...post.commentsList, newComment]
        };
      }
      return post;
    }));
  };

  return (
    <>
      <PageHeader
        title="Join Our Community"
        description="Connect with fellow learners, share study tips, and get help with your questions"
      />

      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category
                    ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm dark:text-gray-300 dark:placeholder-gray-500"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <select
                className="h-full pl-3 pr-10 py-2 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm text-gray-700 dark:text-gray-300 appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="mostComments">Most Comments</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          {!showCreatePost ? (
            <Button
              onClick={() => setShowCreatePost(true)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Create New Post
            </Button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create a New Post</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white"
                  placeholder="Enter a title for your post"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Post Content
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-gray-900 dark:text-white min-h-[150px]"
                  placeholder="Share your thoughts, questions, or resources..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCreatePost(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddPost}
                  disabled={!newPostTitle.trim() || !newPostContent.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{post.author}</h4>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.timeAgo}
                      </div>
                    </div>
                    <span className="ml-auto text-xs font-medium px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between border-t border-b border-gray-200 dark:border-gray-700 py-3 my-4">
                    <button
                      onClick={() => handleStarPost(post.id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${post.userStarred
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                      <Star className={`w-4 h-4 ${post.userStarred ? "fill-yellow-500" : ""}`} />
                      <span>{post.stars}</span>
                    </button>

                    <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments} comments</span>
                    </div>
                  </div>

                  {/* Comments section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Comments</h4>

                    {post.commentsList.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <img
                          src={comment.authorImage}
                          alt={comment.author}
                          className="w-8 h-8 rounded-full object-cover mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline justify-between">
                            <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                              {comment.author}
                            </h5>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.timeAgo}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <button className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{comment.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Comment form */}
                    <div className="flex items-start gap-3 mt-4">
                      <img
                        src={user?.imageUrl || "https://i.pravatar.cc/150?img=12"}
                        alt="You"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <AddCommentForm postId={post.id} onAddComment={handleAddComment} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter to find what you're looking for
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Comment form component
function AddCommentForm({ postId, onAddComment }) {
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddComment(postId, comment);
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 text-sm text-gray-900 dark:text-white"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          type="submit"
          disabled={!comment.trim()}
          size="sm"
          className="whitespace-nowrap"
        >
          Post
        </Button>
      </div>
    </form>
  );
} 