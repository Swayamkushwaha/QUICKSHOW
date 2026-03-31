import axios from 'axios';
import Movie from "../models/Movie.js";
import Show from '../models/Show.js';

// 🎬 1. Get now playing movies from TMDB
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`
      }
    });
    res.json({ success: true, movies: data.results });
  } catch (error) {
    console.error("TMDB Fetch Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.status_message || "Failed to fetch from TMDB"
    });
  }
};

// ➕ 2. Add Shows (Fixed ID and Loop Logic)
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    // ✅ FIX: Ensure ID is a String to match your Mongoose Schema [_id: String]
    const stringMovieId = String(movieId);
    let movie = await Movie.findById(stringMovieId);

    if (!movie) {
      const { data: movieData } = await axios.get(
        `https://api.themoviedb.org/3/movie/${stringMovieId}?append_to_response=credits`,
        {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`
          }
        }
      );

      movie = await Movie.create({
        _id: stringMovieId,
        title: movieData.title,
        overview: movieData.overview,
        poster: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
        backdrop: `https://image.tmdb.org/t/p/original${movieData.backdrop_path}`,
        release_date: movieData.release_date,
        original_language: movieData.original_language,
        tagline: movieData.tagline || "",
        genres: movieData.genres.map(g => g.name),
        casts: movieData.credits?.cast?.slice(0, 10).map(c => ({
          name: c.name,
          profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
          character: c.character
        })) || [],
        vote_average: movieData.vote_average,
        runtime: movieData.runtime
      });
    }

    const showsToCreate = [];
    if (Array.isArray(showsInput)) {
      showsInput.forEach(show => {
        if (show.time && Array.isArray(show.time)) {
          show.time.forEach(time => {
            showsToCreate.push({
              movie: movie._id,
              date: show.date,
              time: time,
              showDateTime: new Date(`${show.date}T${time}`),
              showPrice: Number(showPrice),
              occupiedSeats: {}
            });
          });
        }
      });
    }

    if (showsToCreate.length === 0) {
      return res.status(400).json({ success: false, message: "Please select valid showtimes" });
    }

    await Show.insertMany(showsToCreate);
    res.json({ success: true, message: "Shows added successfully" });

  } catch (error) {
    console.error("Add Show Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🎬 3. Get all shows (Home/Movies Page)
export const getShows = async (req, res) => {
  try {
    // We sort by date to show upcoming movies first
    const shows = await Show.find({})
      .populate('movie')
      .sort({ showDateTime: 1 });

    // Check if we actually got shows back
    if (!shows) {
      return res.json({ success: true, shows: [] });
    }

    res.json({ success: true, shows });
  } catch (error) {
    console.error("Get Shows Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Database error while fetching shows: " + error.message
    });
  }
};

// 🔍 4. Get specific movie details and its showtimes
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    const shows = await Show.find({ movie: movieId }).sort({ showDateTime: 1 });
    const movie = await Movie.findById(movieId);

    if (!movie) return res.json({ success: false, message: "Movie not found" });

    const dateTime = {};
    const showIds = {};

    shows.forEach(show => {
      const dateKey = show.date || show.showDateTime.toISOString().split("T")[0];
      const timeLabel = show.time || show.showDateTime.toISOString().split("T")[1].substring(0, 5);

      if (!dateTime[dateKey]) {
        dateTime[dateKey] = [];
        showIds[dateKey] = [];
      }
      dateTime[dateKey].push(timeLabel);
      showIds[dateKey].push(show._id);
    });

    res.json({
      success: true,
      movie,
      dateTime,
      showIds,
      showPrice: shows[0]?.showPrice || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};