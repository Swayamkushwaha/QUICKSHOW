import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// 1. Configure Axios base URL
axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || "https://quickshow-yml0.onrender.com";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [isProcessing, setIsProcessing] = useState(true);

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ FIX: Axios request interceptor — auto-attach Bearer token to EVERY request
    // This means you never need to manually pass headers anywhere in your app
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(async (config) => {
            try {
                const token = await getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (err) {
                console.error("Token fetch failed in interceptor:", err);
            }
            return config;
        });

        // Cleanup interceptor when component unmounts
        return () => axios.interceptors.request.eject(interceptor);
    }, [getToken]);

    // ✅ 1. Check if the logged-in user is an Admin
    const fetchIsAdmin = async () => {
        try {
            setIsProcessing(true);
            const { data } = await axios.get('/api/admin/is-admin');
            // ↑ No need to manually pass token anymore — interceptor handles it

            if (data.success) {
                setIsAdmin(data.isAdmin);
            } else {
                setIsAdmin(false);
            }

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/');
                toast.error('Not authorized');
            }
        } catch (error) {
            console.error("Admin check failed:", error);
            setIsAdmin(false);
        } finally {
            setIsProcessing(false);
        }
    };

    // ✅ 2. Fetch all movies/shows for the home page
    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/shows/all');
            if (data.success) {
                setShows(data.shows);
            }
        } catch (error) {
            console.error("Failed to fetch shows:", error);
        }
    };

    // ✅ 3. Fetch user's favorite movies
    const fetchFavoriteMovies = async () => {
        try {
            const { data } = await axios.get('/api/user/favorites');
            // ↑ No need to manually pass token — interceptor handles it
            if (data.success) {
                setFavoriteMovies(data.movies);
            }
        } catch (error) {
            console.error("Favorites fetch failed", error);
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    useEffect(() => {
        if (user) {
            fetchIsAdmin();
            fetchFavoriteMovies();
        } else {
            setIsAdmin(false);
            setFavoriteMovies([]);
            setIsProcessing(false);
        }
    }, [user]);

    const value = {
        axios,
        user,
        getToken,
        navigate,
        isAdmin,
        isProcessing,
        shows,
        favoriteMovies,
        fetchFavoriteMovies,
        fetchIsAdmin,
        fetchShows,
        setShows
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
