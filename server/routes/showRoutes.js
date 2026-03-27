import express from "express";
import { addShow, getNowPlayingMovies, getShows, getShow } from "../controllers/showController.js";

const router = express.Router();

// ✅ FIX: Ensure this is spelled exactly like the frontend expects
router.get("/now-playing", getNowPlayingMovies);
router.post("/add", addShow);
router.get("/all", getShows);
router.get("/:movieId", getShow);

export default router;