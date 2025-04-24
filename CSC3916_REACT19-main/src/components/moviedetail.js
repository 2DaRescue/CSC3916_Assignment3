import React, { useEffect } from 'react';
import { fetchMovie, submitReview } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom'; // Import useParams
import ReviewForm from './ReviewForm'; 

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams(); // Get movieId from URL parameters
  const selectedMovie = useSelector(state => state.movie.selectedMovie);
  const loading = useSelector(state => state.movie.loading); // Assuming you have a loading state in your reducer
  const error = useSelector(state => state.movie.error); // Assuming you have an error state in your reducer


  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const DetailInfo = () => {
    if (loading) {
      return <div>Loading....</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (!selectedMovie) {
      return <div>No movie data available.</div>;
    }

    console.log("🎬 selectedMovie:", selectedMovie);
    return (
      <Card className="bg-dark text-light p-4 rounded">
        <Card.Header>Movie Detail</Card.Header>
        <Card.Body>
          <Image className="image" src={selectedMovie.imageURL} thumbnail />
          <ReviewForm
            movieId={movieId}
            onSubmit={(data) =>
              dispatch(submitReview(data)).then(() => dispatch(fetchMovie(movieId)))
            }
          />
        </Card.Body>
        <ListGroup className="bg-dark text-dark p-4 rounded">
          <ListGroupItem>{selectedMovie.title}</ListGroupItem>
          <ListGroupItem>
            {selectedMovie.actors.map((actor, i) => (
              <p key={i}>
                <b>{actor.actorName}</b> {actor.characterName}
              </p>
            ))}
          </ListGroupItem>
          <ListGroupItem>
            <h4>
              <BsStarFill /> {selectedMovie.avgRating}
            </h4>
          </ListGroupItem>
        </ListGroup>
        <Card.Body>
  <h5 style={{ color: "white" }} >Reviews</h5>
  {Array.isArray(selectedMovie.reviews) && selectedMovie.reviews.length > 0 ? (
    selectedMovie.reviews.map((review, i) => (
      <p key={i} style={{ color: "white" }}>
        <b>{review.username}</b> {review.review} <BsStarFill /> {review.rating}
      </p>
    ))
  ) : (
    <p style={{ color: "white" }}>There are no reviews yet, be the first to leave one!</p>
  )}
</Card.Body>
      </Card>
    );
  };

  return <DetailInfo />;
};


export default MovieDetail;