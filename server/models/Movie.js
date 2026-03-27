import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  overview: {
    type: String,
    default: ""
  },

  // ✅ FIX: renamed from poster_path/backdrop_path to poster/backdrop
  // These now store full image URLs instead of relative paths
  poster: {
    type: String,
    required: true
  },
  backdrop: {
    type: String,
    default: ""
  },

  release_date: {
    type: String,
    default: ""
  },
  original_language: {
    type: String,
    default: ""
  },
  tagline: {
    type: String,
    default: ""
  },
  genres: {
    type: [String],
    default: []
  },
  casts: [
    {
      name: String,
      profile_path: String,
      character: String
    }
  ],
  vote_average: {
    type: Number,
    default: 0
  },
  runtime: {
    type: Number,
    default: 0
  }
});

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;