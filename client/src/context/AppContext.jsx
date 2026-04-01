import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Ensure this matches your Render URL exactly
axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

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

    // Attach Bearer token to every request
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
        return () => axios.interceptors.request.eject(interceptor);
    }, [getToken]);

    const fetchIsAdmin = async () => {
        try {
            setIsProcessing(true);
            const { data } = await axios.get('/api/admin/is-admin');
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

    // ✅ FIXED: Calling the correct route defined in showRouter.js
    const fetchShows = async () => {
        try {
            // Using '/api/shows' instead of '/api/shows/all' to avoid 500 errors
            const { data } = await axios.get('/api/shows'); 
            if (data.success) {
                setShows(data.shows);
                console.log("Shows fetched successfully:", data.shows);
            }
        } catch (error) {
            console.error("Failed to fetch shows:", error);
        }
    };

    const fetchFavoriteMovies = async () => {
        try {
            const { data } = await axios.get('/api/user/favorites');
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