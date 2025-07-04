import React, { useState } from 'react';
import EditCommentModal from './EditCommentModal';
import DeleteCommentConfirmationModal from './DeleteCommentConfirmationModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';

const Comment = ({ comment, onCommentUpdated, onCommentDeleted }) => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState('');

  const canEditComment = () => {
    return user && (user.role === 'ADMIN' || user.email === comment.authorEmail);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLike = async () => {
    if (!user) return;
    
    setIsLiking(true);
    try {
      const response = await api.post(ENDPOINTS.COMMENTS.LIKE(comment.postId, comment.commentId), {
        commentId: comment.commentId,
        like: !comment.hasLiked // Toggle like state
      });
      
      // Update the comment with new like count and status
      const newHasLiked = !comment.hasLiked;
      onCommentUpdated({
        ...comment,
        upvotes: response.data.likeCount,
        hasLiked: newHasLiked
      });
    } catch (err) {
      setError('Failed to like comment. Please try again.');
      console.error('Error liking comment:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(ENDPOINTS.POSTS.COMMENT_DETAIL(comment.postId, comment.commentId));
      onCommentDeleted(comment.commentId);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment. Please try again.');
    }
  };

  return (
    <div className="bg-[#f8fafc] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#e2e8f0]">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-[#708eb3]">{comment.authorName}</h3>
        <div className="flex flex-wrap items-center text-xs sm:text-sm text-[#a4b5c5] mb-2 sm:mb-3">
          <span className="whitespace-nowrap">{formatDate(comment.creationDate)}</span>
          {comment.isEdited && (
            <>
              <span className="mx-1 sm:mx-2">•</span>
              <span className="italic">Edited</span>
            </>
          )}
        </div>
      </div>

      <p className="text-sm sm:text-base text-[#819bb9] whitespace-pre-wrap my-3 sm:my-4">{comment.description}</p>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={!user || isLiking}
            className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
              user 
                ? comment.hasLiked 
                  ? 'bg-[#819bb9] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95' 
                  : 'text-[#92a8bf] hover:bg-[#f6f3e3] hover:scale-105 active:scale-95 shadow-sm hover:shadow-md'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={!user ? 'Login to like this comment' : comment.hasLiked ? 'Click to remove your like' : 'Like this comment'}
          >
            <svg
              className={`h-5 w-5 transition-all duration-300 ${
                comment.hasLiked ? 'text-white' : 'text-[#92a8bf]'
              }`}
              fill={comment.hasLiked ? 'currentColor' : 'none'}
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
            <span className="text-sm sm:text-base font-medium">{comment.upvotes}</span>
          </button>
        </div>
        {canEditComment() && (
          <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end mt-2 sm:mt-0">
            <button
              onClick={handleEdit}
              className="w-9 h-9 sm:w-auto sm:h-auto bg-[#92a8bf] hover:bg-[#819bb9] text-white p-2 sm:px-4 sm:py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit comment"
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
              title="Delete comment"
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
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 sm:mt-4 bg-red-50 border-l-4 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg animate-fade-in text-sm sm:text-base">
          {error}
        </div>
      )}

      <EditCommentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onCommentUpdated={onCommentUpdated}
        comment={comment}
      />

      <DeleteCommentConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Comment; 