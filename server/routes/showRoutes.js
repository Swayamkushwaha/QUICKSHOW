import express from 'express';
const showRouter = express.Router();
import { getShows, getNowPlayingMovies, addShow, getShow } from '../controllers/showController.js';

// If this is '/', the full URL is /api/shows
// If you want it to be /api/shows/all, change '/' to '/all'
showRouter.get('/', getShows); 
showRouter.get('/now-playing', getNowPlayingMovies);
showRouter.post('/add', addShow);
showRouter.get('/:movieId', getShow);

export default showRouter;