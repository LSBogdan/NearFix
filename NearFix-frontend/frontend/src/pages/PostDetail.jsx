import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import Comment from '../components/Comment';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { UI, ENDPOINTS } from '../config';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('creationDate');
  const [sortDirection, setSortDirection] = useState('DESC');

  const handleLike = async () => {
    if (!user) return;
    
    setIsLiking(true);
    try {
      const response = await api.post(ENDPOINTS.POSTS.DETAIL(postId) + '/like', {
        like: !post?.hasLiked // Toggle like state
      });
      
      // Update the post with new like count and status
      const newHasLiked = !post?.hasLiked;
      setPost(prev => ({
        ...prev,
        upvotes: response.data.likeCount,
        hasLiked: newHasLiked
      }));
    } catch (err) {
      setError('Failed to like post. Please try again.');
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const COMMENT_MAX_LENGTH = 250;

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= COMMENT_MAX_LENGTH) {
      setNewComment(value);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await api.get(ENDPOINTS.POSTS.DETAIL(postId));
      setPost(response.data);
    } catch (err) {
      setError('Failed to fetch post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(ENDPOINTS.POSTS.COMMENTS(postId), {
        params: {
          page,
          size: UI.PAGINATION.DEFAULT_PAGE_SIZE,
          sortBy,
          sortDirection
        }
      });
      setComments(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      setError('Failed to fetch comments');
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [postId, page, sortBy, sortDirection]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await api.post(
        ENDPOINTS.POSTS.COMMENTS(postId),
        { description: newComment }
      );
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      // Refresh comments to update pagination
      fetchComments();
    } catch (err) {
      setError('Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleSort = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortDirection('DESC');
    }
    setPage(0); // Reset to first page on new sort
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.commentId === updatedComment.commentId ? updatedComment : comment
      )
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prevComments => 
      prevComments.filter(comment => comment.commentId !== commentId)
    );
    // Refresh comments to update pagination
    fetchComments();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f6f3e3] flex items-center justify-center">
        <div className="text-xl text-gray-800">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f3e3] py-4 sm:py-8 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="text-[#92a8bf] hover:text-[#819bb9] mb-4 sm:mb-6 flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Feed
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 animate-fade-in text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transform transition-all duration-300 hover:shadow-xl">
          <h1 className="text-xl sm:text-2xl font-bold text-[#708eb3] mb-2 sm:mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center text-xs sm:text-sm text-[#a4b5c5] mb-4 sm:mb-6">
            <span>Posted by {post.authorName}</span>
            <span className="mx-1 sm:mx-2">•</span>
            <span className="whitespace-nowrap">{formatDate(post.creationDate)}</span>
          </div>
          <p className="text-[#819bb9] text-base sm:text-lg mb-4 sm:mb-6">{post.description}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`flex items-center text-sm sm:text-base transition-all duration-300 ${user ? 'text-[#92a8bf] hover:scale-110 active:scale-95' : 'text-gray-400'} ${post?.hasLiked ? 'text-[#819bb9]' : ''}`}
              title={!user ? 'Login to like this post' : post?.hasLiked ? 'Click to remove your like' : 'Like this post'}
            >
              <svg 
                className={`h-5 w-5 ${isLiking ? 'animate-pulse' : ''}`} 
                fill={post.hasLiked ? 'currentColor' : 'none'} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" 
                />
              </svg>
              <span className="ml-1">{post.upvotes || 0}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#708eb3] mb-4 sm:mb-6">Comments</h2>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
            <span className="text-sm sm:text-base text-[#819bb9]">
              {totalElements} {totalElements === 1 ? 'comment' : 'comments'}
            </span>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <span className="text-sm sm:text-base text-[#819bb9] whitespace-nowrap">Sort by:</span>
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
                    <span className="transform transition-transform duration-300">
                      {sortDirection === 'ASC' ? '↑' : '↓'}
                    </span>
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
                    <span className="ml-1 sm:ml-2">
                      {sortDirection === 'ASC' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitComment} className="mb-6 sm:mb-8">
            <div className="mb-2">
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Write a comment..."
                rows="3"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent resize-none text-sm sm:text-base"
                disabled={commentLoading}
              />
              <div className="text-right text-xs sm:text-sm text-[#a4b5c5] mt-1">
                {newComment.length}/{COMMENT_MAX_LENGTH}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || commentLoading}
                className="w-10 h-10 sm:w-auto sm:h-auto bg-[#92a8bf] hover:bg-[#819bb9] text-white p-2 sm:px-6 sm:py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                title="Post Comment"
              >
                {commentLoading ? (
                  <span className="inline sm:hidden">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : (
                  <>
                    <svg 
                      className="h-5 w-5 sm:h-5 sm:w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                      />
                    </svg>
                    <span className="hidden sm:inline">Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="space-y-4 sm:space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-[#a4b5c5]">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment.commentId}
                  comment={comment}
                  onCommentUpdated={handleCommentUpdated}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-6 sm:mt-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-[#92a8bf] hover:text-[#708eb3] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-center"
              >
                Previous
              </button>
              <span className="text-sm sm:text-base text-[#819bb9] text-center">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-[#92a8bf] hover:text-[#708eb3] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-center"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;