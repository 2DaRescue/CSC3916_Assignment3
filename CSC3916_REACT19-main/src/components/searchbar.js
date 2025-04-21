import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, ListGroup } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { searchMovies } from '../actions/movieActions';

const SearchBar = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch suggestions as user types
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.length >= 2) {
        fetch(`${process.env.REACT_APP_API_URL}/search?query=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': localStorage.getItem('token')
          }
        })
          .then(res => res.json())
          .then(data => {
            setSuggestions(data);
            setShowSuggestions(true);
          });
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSelect = (title) => {
    setQuery(title);
    setShowSuggestions(false);
    dispatch(searchMovies(title));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(searchMovies(query));
    setShowSuggestions(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Search by title or actor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="primary" type="submit">Search</Button>
        </InputGroup>
      </Form>

      {showSuggestions && suggestions.length > 0 && (
        <ListGroup style={{
          position: 'absolute',
          top: '100%',
          width: '100%',
          zIndex: 5,
          maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {suggestions.map((movie) => (
            <ListGroup.Item
              key={movie._id}
              action
              onClick={() => handleSelect(movie.title)}
            >
              {movie.title} ({movie.releaseDate})
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default SearchBar;
