import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Reviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock API call
      // await api.post(`/projects/${id}/reviews`, { rating, comment });
      setTimeout(() => {
        setLoading(false);
        alert('Review submitted successfully!');
        navigate('/applications');
      }, 500);
    } catch (err) {
      setLoading(false);
      alert('Failed to submit review');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto' }} className="card">
      <h2 className="page-title text-center" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        Review Project #{id}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Rating</label>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '2rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                onClick={() => setRating(star)}
                style={{ cursor: 'pointer', color: star <= rating ? '#F59E0B' : '#E5E7EB' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Comment</label>
          <textarea 
            className="form-input" 
            rows="4" 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            placeholder="How was your experience working on this project?"
            required 
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default Reviews;
