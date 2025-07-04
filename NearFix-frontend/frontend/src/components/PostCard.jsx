import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditPostModal from './EditPostModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';

const PostCard = ({ post: initialPost, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState('');
  const [post, setPost] = useState(initialPost);
  const [hasLiked, setHasLiked] = useState(false);

  // Update local state when initialPost changes
  useEffect(() => {
    setPost(initialPost);
    // Update hasLiked state when post data changes
    if (initialPost?.hasLiked !== undefined) {
      setHasLiked(initialPost.hasLiked);
    }
  }, [initialPost]);

  const handleLike = async () => {
    if (!user) return;
    
    setIsLiking(true);
    try {
      const response = await api.post(ENDPOINTS.POSTS.DETAIL(post.postId) + '/like', {
        like: !hasLiked // Toggle like state
      });
      
      // Update the post with new like count and status
      const newHasLiked = !hasLiked;
      setPost(prev => ({
        ...prev,
        upvotes: response.data.likeCount,
        hasLiked: newHasLiked
      }));
      
      // Update local state
      setHasLiked(newHasLiked);
      
      // Notify parent component about the update
      if (onPostUpdated) {
        onPostUpdated({
          ...post,
          upvotes: response.data.likeCount,
          hasLiked: newHasLiked
        });
      }
    } catch (err) {
      setError('Failed to like post. Please try again.');
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const truncateDescription = (description) => {
    if (description.length <= 50) return description;
    return description.substring(0, 50) + '...';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canEditPost = user && (user.role === 'ADMIN' || user.email === post.authorEmail);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await api.delete(ENDPOINTS.POSTS.DETAIL(post.postId));
      onPostDeleted(post.postId);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 transform transition-all duration-300 hover:shadow-xl">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 animate-fade-in text-sm sm:text-base">
          {error}
        </div>
      )}
      <h2 className="text-lg sm:text-xl font-semibold text-[#708eb3] mb-1 sm:mb-2">{post.title}</h2>
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-[#a4b5c5] mb-2 sm:mb-3">
        <span className="whitespace-nowrap">Posted by {post.authorName}</span>
        <span className="mx-1 sm:mx-2">•</span>
        <span className="whitespace-nowrap">{formatDate(post.creationDate)}</span>
        {post.isEdited && (
          <>
            <span className="mx-1 sm:mx-2">•</span>
            <span className="italic">Edited</span>
          </>
        )}
      </div>
      <p className="text-sm sm:text-base text-[#819bb9] mb-3 sm:mb-4">{truncateDescription(post.description)}</p>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={!user || isLiking}
            className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
              user 
                ? hasLiked 
                  ? 'bg-[#819bb9] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                  : 'text-[#92a8bf] hover:bg-[#f6f3e3] hover:scale-105 active:scale-95 shadow-sm hover:shadow-md'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={!user ? 'Login to like this post' : hasLiked ? 'Click to remove your like' : 'Like this post'}
          >
            {/* Animated heart icon */}
            <div className="relative">
              <svg 
                className={`h-5 w-5 transition-all duration-300 ${
                  isLiking ? 'animate-pulse' : ''
                } ${
                  hasLiked 
                    ? 'transform scale-110 animate-heartBeat' 
                    : 'group-hover:scale-110'
                }`}
                fill={hasLiked ? 'currentColor' : 'none'} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={hasLiked ? 0 : 2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                />
              </svg>
            </div>
            
            {/* Like count with animation */}
            <span className={`font-medium transition-all duration-300 ${
              hasLiked ? 'text-white' : 'text-[#819bb9]'
            }`}>
              {post.upvotes || 0}
            </span>
            
            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
          </button>
        </div>
        <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end">
          {canEditPost && (
            <>
              <button
                onClick={handleEdit}
                className="w-9 h-9 sm:w-auto sm:h-auto bg-[#92a8bf] hover:bg-[#819bb9] text-white p-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
                title="Edit post"
              >
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                  />
                </svg>
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-9 h-9 sm:w-auto sm:h-auto bg-red-500 hover:bg-red-600 text-white p-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
                title="Delete post"
              >
                <svg 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
          <Link
            to={`/posts/${post.postId}`}
            className="w-9 h-9 sm:w-auto sm:h-auto bg-[#92a8bf] hover:bg-[#819bb9] text-white p-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
            title="View comments"
          >
            <svg 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
              />
            </svg>
            <span className="hidden sm:inline">Comment</span>
          </Link>
        </div>
      </div>

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPostUpdated={onPostUpdated}
        post={post}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PostCard; 