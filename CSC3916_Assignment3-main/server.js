require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt'); // You're not using authController, consider removing it
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies'); // You're not using Movie, consider removing it
const { default: mongoose } = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

const router = express.Router();

// Removed getJSONObjectForMovieRequirement as it's not used

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅"))
  .catch(err => console.error("❌", err));

app.get("/", (req, res) => {
  res.send("You made it !! --  Welcome to my API ");
});


router.post('/signup', async (req, res) => { // Use async/await
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' }); // 400 Bad Request
  }

  try {
    const user = new User({ // Create user directly with the data
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
    });

    await user.save(); // Use await with user.save()

    res.status(201).json({ success: true, msg: 'Successfully created new user.' }); // 201 Created
  } catch (err) {
    if (err.code === 11000) { // Strict equality check (===)
      return res.status(409).json({ success: false, message: 'A user with that username already exists.' }); // 409 Conflict
    } else {
      console.error(err); // Log the error for debugging
      return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
    }
  }
});


router.post('/signin', async (req, res) => { // Use async/await
  try {
    const user = await User.findOne({ username: req.body.username }).select('name username password');

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' }); // 401 Unauthorized
    }

    const isMatch = await user.comparePassword(req.body.password); // Use await

    if (isMatch) {
      const userToken = { id: user._id, username: user.username }; // Use user._id (standard Mongoose)
      const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Add expiry to the token (e.g., 1 hour)
      res.json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' }); // 401 Unauthorized
    }
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
  }
});

router.route('/movies')
  .get(authJwtController.isAuthenticated, async (req, res) => {
    try {
      const movies = await Movie.find(); // Fetch all movies from MongoDB
      return res.status(200).json(movies);
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch movies', error: error.message });
    }
  })
  .post(authJwtController.isAuthenticated, async (req, res) => {
    const { title, releaseDate, genre, actors, imageURL} = req.body;

    const existingMovie = await Movie.findOne({ title });
        if (existingMovie) {
            return res.status(409).json({ success: false, message: "A movie with this title already exists." });
        }
        
    // Validate that required fields exist
    if (!title || !releaseDate || !genre || !actors || actors.length < 1) {
      return res.status(400).json({ success: false, message: 'All fields including at least one actor are required' });
    }

    try {
      const newMovie = new Movie({ title, releaseDate, genre, actors,imageURL });
      await newMovie.save();
      res.status(201).json({ success: true, message: 'Movie added successfully', movie: newMovie });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error saving movie', error: err });
    }
  });

  router.route('/movies/:movieparameter')
    // ✅ GET: Fetch a single movie by title (Requires JWT Authentication)
    .get(authJwtController.isAuthenticated, async (req, res) => {
        try {
            const movie = await Movie.findOne({ title: req.params.movieparameter });
            if (!movie) return res.status(404).json({ success: false, message: "Movie not found" });
            res.status(200).json(movie);
        } catch (err) {
            res.status(500).json({ success: false, message: "Failed to fetch movie" });
        }
    })

    // ✅ PUT: Update a movie by title (Requires JWT Authentication)
    .put(authJwtController.isAuthenticated, async (req, res) => {
        try {
            const { title, releaseDate, genre, actors, imageURL } = req.body;

            const updatedMovie = await Movie.findOneAndUpdate(
                { title: req.params.movieparameter }, // Find movie by title
                { title, releaseDate, genre, actors, imageURL }, // Update fields
                { new: true }, // Return the updated document
                
            );

            if (!updatedMovie) {
                return res.status(404).json({ success: false, message: "Movie not found" });
            }

            res.status(200).json({ success: true, message: "Movie updated successfully", movie: updatedMovie });
        } catch (err) {
            res.status(500).json({ success: false, message: "Error updating movie" });
        }
    })

    // ✅ DELETE: Remove a movie by title (Requires JWT Authentication)
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

app.use('/', router);

const PORT = process.env.PORT || 8080; // Define PORT before using it
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

module.exports = app; // for testing only