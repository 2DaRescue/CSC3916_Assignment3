import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const ReviewForm = ({ movieId, onSubmit }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ movieId, review: reviewText, rating: Number(rating) });
      alert('✅ Review submitted!');
      setReviewText('');
      setRating(5);
    } catch (err) {
      if (err.status === 409 || (err.message && err.message.includes('already'))) {
        alert('You have already posted a review for this movie.');
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div>
      <h5>Submit a Review</h5>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="reviewText" className="mb-2">
          <Form.Label>Review</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="rating" className="mb-2">
          <Form.Label>Rating</Form.Label>
          <Form.Control
            as="select"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button type="submit" variant="success">Submit Review</Button>
      </Form>
    </div>
  );
};

export default ReviewForm;
