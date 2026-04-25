import React, { useState, useEffect } from 'react';
import api from "../../axios";

function AReviews() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Simple filters
  const [filters, setFilters] = useState({
    isFlagged: 'all',
    isVisible: 'all'
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, filters]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/manage-reviews');
      setReviews(response.data);
      setFilteredReviews(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
      showToast('Failed to fetch reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reviews];

    if (filters.isFlagged !== 'all') {
      filtered = filtered.filter(
        review => review.is_flagged === (filters.isFlagged === 'true')
      );
    }

    if (filters.isVisible !== 'all') {
      filtered = filtered.filter(
        review => review.is_visible === (filters.isVisible === 'true')
      );
    }

    setFilteredReviews(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      isFlagged: 'all',
      isVisible: 'all'
    });
  };

  // PATCH function to update review (can update both flag and visibility)
  const updateReview = async (reviewId, updates) => {
    try {
      const response = await api.patch(`/admin/manage-reviews/${reviewId}`, updates);

      // Update the review in state
      setReviews(reviews.map(review =>
        review.review_id === reviewId ? response.data : review
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error updating review:', err);
      throw err;
    }
  };

  // Toggle flag status
  const handleToggleFlag = async (reviewId, currentFlagStatus) => {
    try {
      await updateReview(reviewId, { is_flagged: !currentFlagStatus });
      showToast(`Review ${!currentFlagStatus ? 'flagged' : 'unflagged'} successfully`);
    } catch (err) {
      showToast('Failed to update review flag status', 'error');
    }
  };

  // Toggle visibility status
  const handleToggleVisibility = async (reviewId, currentVisibility) => {
    try {
      await updateReview(reviewId, { is_visible: !currentVisibility });
      showToast(`Review ${!currentVisibility ? 'shown' : 'hidden'} successfully`);
    } catch (err) {
      showToast('Failed to update review visibility', 'error');
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="drawer lg:drawer-open">
        <div className="drawer-content">
          <div className="p-6">
            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="drawer lg:drawer-open">
        <div className="drawer-content">
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>Error: {error}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open">
      <div className="drawer-content">
        <div className="p-6">
          {/* Toast Notification */}
          {toast.show && (
            <div className="fixed top-4 right-4 z-50 animate-slide-in">
              <div className={`rounded-lg shadow-lg p-4 ${
                toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {toast.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-sm ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {toast.message}
                  </span>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6">Manage Coach Reviews</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-blue-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{reviews.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-red-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Flagged Reviews</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{reviews.filter(r => r.is_flagged).length}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-gray-800">Filters</h3>
              <button 
                onClick={clearFilters} 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Flagged Status
                </label>
                <select 
                  name="isFlagged" 
                  value={filters.isFlagged} 
                  onChange={handleFilterChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Reviews</option>
                  <option value="true">Flagged Only</option>
                  <option value="false">Not Flagged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  Visibility
                </label>
                <select 
                  name="isVisible" 
                  value={filters.isVisible} 
                  onChange={handleFilterChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All</option>
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-500 mt-4">
              Showing {filteredReviews.length} of {reviews.length} reviews
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500">No reviews found</p>
                          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map(review => (
                      <tr key={review.review_id} className={!review.is_visible ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{review.review_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.coach_profile_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.client_user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="tooltip" data-tip={`${review.rating} out of 5`}>
                            <span className="text-lg">{getRatingStars(review.rating)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs">
                            {review.comment ? (
                              <p className="text-sm">{review.comment.length > 100 ? review.comment.substring(0, 100) + '...' : review.comment}</p>
                            ) : (
                              <span className="text-gray-400 italic">No comment</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1 flex-wrap">
                            {review.is_flagged && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                🚩 Flagged
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              review.is_visible ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {review.is_visible ? '👁️ Visible' : '👁️‍🗨️ Hidden'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(review.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleFlag(review.review_id, review.is_flagged)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                review.is_flagged 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                              title={review.is_flagged ? 'Remove flag' : 'Flag review'}
                            >
                              {review.is_flagged ? '🏁 Unflag' : '🚩 Flag'}
                            </button>
                            <button
                              onClick={() => handleToggleVisibility(review.review_id, review.is_visible)}
                              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                                review.is_visible 
                                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                              title={review.is_visible ? 'Hide review' : 'Show review'}
                            >
                              {review.is_visible ? '👁️ Hide' : '👁️‍🗨️ Show'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AReviews;