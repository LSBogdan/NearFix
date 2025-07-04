import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import api from '../utils/axios';
import { ENDPOINTS } from '../config';

const EditPostModal = ({ isOpen, onClose, onPostUpdated, post }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const TITLE_MAX_LENGTH = 50;
  const DESCRIPTION_MAX_LENGTH = 250;

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setDescription(post.description);
    }
  }, [post]);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= TITLE_MAX_LENGTH) {
      setTitle(value);
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= DESCRIPTION_MAX_LENGTH) {
      setDescription(value);
    }
  };

  const hasChanges = () => {
    return title !== post.title || description !== post.description;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check if any changes were made
    if (!hasChanges()) {
      setError('No changes were made to the post.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(ENDPOINTS.POSTS.DETAIL(post.postId), {
        title,
        description,
        isEdited: true // Add flag to indicate post was edited
      });

      if (response.data) {
        onPostUpdated(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-xl transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#708eb3]">Edit Post</h2>
            <button
              onClick={onClose}
              className="text-[#a4b5c5] hover:text-[#819bb9] transition-colors duration-300"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#819bb9]" htmlFor="title">
                  Title <span className="text-red-400">*</span>
                </label>
                <span className={`text-sm ${title.length === TITLE_MAX_LENGTH ? 'text-red-500' : 'text-[#a4b5c5]'}`}>
                  {title.length}/{TITLE_MAX_LENGTH}
                </span>
              </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300"
                required
                disabled={loading}
                maxLength={TITLE_MAX_LENGTH}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#819bb9]" htmlFor="description">
                  Description <span className="text-red-400">*</span>
                </label>
                <span className={`text-sm ${description.length === DESCRIPTION_MAX_LENGTH ? 'text-red-500' : 'text-[#a4b5c5]'}`}>
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="w-full px-4 py-3 border border-[#a4b5c5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92a8bf] focus:border-transparent transition-all duration-300 min-h-[150px]"
                required
                disabled={loading}
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-[#819bb9] hover:text-[#708eb3] disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#92a8bf] hover:bg-[#819bb9] text-white px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                disabled={loading || !hasChanges()}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Updating...
                  </>
                ) : (
                  'Update Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal; 