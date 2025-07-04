import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import Spinner from '../components/Spinner';
import CreatePostModal from '../components/CreatePostModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { ENDPOINTS, UI } from '../config';

const Feed = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('creationDate');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      if (authLoading) return;
      if (!isAuthenticated) {
        setError('Please login to view posts');
        return;
      }

      const response = await api.get(ENDPOINTS.POSTS.BASE, {
        params: {
          page,
          size: UI.PAGINATION.DEFAULT_PAGE_SIZE,
          sortBy,
          sortDirection,
          searchTerm: searchQuery.trim()
        }
      });
      
      if (response.data) {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        if (err.response?.data?.message === 'Invalid refresh token') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setError('Failed to fetch posts. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback((value) => {
    setPage(0); // Reset to first page on new search
    setSearchQuery(value);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchPosts();
    }
  }, [page, sortBy, sortDirection, searchQuery, authLoading, isAuthenticated]);

  const handleSort = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortDirection('DESC');
    }
    setPage(0); // Reset to first page on new sort
  };

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    // Refresh the posts to get updated pagination
    fetchPosts();
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.postId === updatedPost.postId ? updatedPost : post
    ));
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.postId !== deletedPostId));
    // Refresh the posts to get updated pagination
    fetchPosts();
  };

  if (authLoading || (loading && page === 0)) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 animate-fade-in text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#708eb3]">Feed</h1>
          <button
            onClick={handleCreatePost}
            className="w-full sm:w-auto bg-[#92a8bf] hover:bg-[#819bb9] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <svg 
              className="h-4 w-4 sm:h-5 sm:w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            Create Post
          </button>
        </div>

        {/* Search and Sort Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 transform transition-all duration-300 hover:shadow-xl">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => debouncedSearch(e.target.value)}
                placeholder="Search posts..."
                className="w-full px-5 py-3 pl-12 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300 text-sm sm:text-base hover:shadow-md"
              />
              <svg 
                className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#819bb9]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div className="text-sm text-[#819bb9]">
              Showing {posts.length} of {totalElements} posts
            </div>
            <div className="flex items-center flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
              <span className="text-sm text-[#819bb9] whitespace-nowrap">Sort by:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSort('creationDate')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm ${
                    sortBy === 'creationDate'
                      ? 'bg-[#92a8bf] text-white hover:bg-[#819bb9] hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                      : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                  }`}
                >
                  Date
                  {sortBy === 'creationDate' && (
                    <svg
                      className={`h-4 w-4 transform transition-transform duration-300 ${
                        sortDirection === 'ASC' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleSort('upvotes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-sm ${
                    sortBy === 'upvotes'
                      ? 'bg-[#92a8bf] text-white hover:bg-[#819bb9] hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                      : 'text-[#819bb9] hover:bg-[#f6f3e3] hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                  }`}
                >
                  Upvotes
                  {sortBy === 'upvotes' && (
                    <svg
                      className={`h-4 w-4 transform transition-transform duration-300 ${
                        sortDirection === 'ASC' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <svg
                  className="h-16 w-16 text-[#819bb9]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-[#708eb3]">No Posts Yet</h3>
                <p className="text-[#819bb9] max-w-md">
                  Be the first to share your thoughts! Click the "Create Post" button above to start a new discussion.
                </p>
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.postId} 
                post={post} 
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Previous
            </button>
            <span className="text-[#819bb9]">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages - 1}
              className="px-4 py-2 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Next
            </button>
          </div>
        )}

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </div>
  );
};

export default Feed; 