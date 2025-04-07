require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const mongoose = require('mongoose').default;

const authJwtController = require('./auth_jwt');
const User = require('./Users');
const Movie = require('./Movies');
const Review = require('./Reviews');
const trackReviewGA4 = require('./analytics');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

const router = express.Router();

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("\u2705 Connected to MongoDB"))
  .catch(err => console.error("\u274C MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("You made it !! --  Welcome to my API ");
});

// ====================== AUTH ======================
router.post('/signup', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' });
  }

  try {
    const user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    });
    await user.save();
    res.status(201).json({ success: true, msg: 'Successfully created new user.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A user with that username already exists.' });
    } else {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
    }
  }
});

router.post('/signin', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username }).select('name username password');
    if (!user) return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' });

    const isMatch = await user.comparePassword(req.body.password);
    if (isMatch) {
      const userToken = { id: user._id, username: user.username };
      const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' });
      res.json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  }
});

// ====================== MOVIES ======================
router.route('/movies')
  .get(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const movies = await Movie.find();
      return res.status(200).json(movies);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch movies', error: error.message });
    }
  })
  .post(authJwtController.isAuthenticated, async (req, res) => {
    const { title, releaseDate, genre, actors, imageURL } = req.body;

    const existingMovie = await Movie.findOne({ title });
    if (existingMovie) {
      return res.status(409).json({ success: false, message: "A movie with this title already exists." });
    }

    if (!title || !releaseDate || !genre || !actors || actors.length < 1) {
      return res.status(400).json({ success: false, message: 'All fields including at least one actor are required' });
    }

    try {
      const newMovie = new Movie({ title, releaseDate, genre, actors, imageURL });
      await newMovie.save();
      res.status(201).json({ success: true, message: 'Movie added successfully', movie: newMovie });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error saving movie', error: err });
    }
  });

router.route('/movies/:movieparameter')
  .get(authJwtController.isAuthenticated, async (req, res) => {
    const includeReviews = req.query.reviews === 'true';

    try {
      const movie = await Movie.findOne({ title: req.params.movieparameter });
      if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

      if (includeReviews) {
        const result = await Movie.aggregate([
          { $match: { _id: movie._id } },
          {
            $lookup: {
              from: 'reviews',
              localField: '_id',
              foreignField: 'movieId',
              as: 'reviews'
            }
          }
        ]);
        return res.status(200).json(result[0]);
      }

      return res.status(200).json(movie);
    } catch (err) {
      console.error('Aggregation error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch movie', error: err.message });
    }
  })
  .put(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const { title, releaseDate, genre, actors, imageURL } = req.body;
      const updatedMovie = await Movie.findOneAndUpdate(
        { title: req.params.movieparameter },
        { title, releaseDate, genre, actors, imageURL },
        { new: true },
      );

      if (!updatedMovie) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }

      res.status(200).json({ success: true, message: "Movie updated successfully", movie: updatedMovie });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error updating movie" });
    }
  })
  .delete(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const deletedMovie = await Movie.findOneAndDelete({ title: req.params.movieparameter });
      if (!deletedMovie) {
        return res.status(404).json({ success: false, message: "Movie not found" });
      }

      res.status(200).json({ success: true, message: `Movie '${deletedMovie.title}' deleted successfully` });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to delete movie" });
    }
  });

// ====================== REVIEWS ======================
router.post('/reviews', authJwtController.isAuthenticated, async (req, res) => {
  const { movieId, review, rating } = req.body;
  const username = req.user?.username || "anonymous";

  if (!movieId || !review || rating == null) {
    return res.status(400).json({ message: 'movieId, review, and rating are required.' });
  }

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found for review' });
    }

    const existingReview = await Review.findOne({ movieId, username });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this movie.' });
    }

    const newReview = new Review({ movieId, username, review, rating });
    await newReview.save();

    await trackReviewGA4(movie.title, movie.genre, username);

    res.status(201).json({ message: 'Review created!' });
  } catch (err) {
    console.error("\u274C Error saving review or sending analytics:", err);
    res.status(500).json({ message: 'Failed to save review', error: err.message });
  }
});

router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
});

router.delete('/reviews/:id', authJwtController.isAuthenticated, async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID format' });
  }

  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
});

app.use('/', router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

module.exports = app;
