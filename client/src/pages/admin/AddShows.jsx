import React, { useEffect, useState } from "react";
import { PlusIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddShows = () => {
  const { axios, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie]       = useState(null);
  const [showPrice, setShowPrice]               = useState("");
  const [dateTimeInput, setDateTimeInput]       = useState("");
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [addingShow, setAddingShow]             = useState(false);
  const [loading, setLoading]                   = useState(true);

  const fetchNowPlayingMovies = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/shows/now-playing");
      if (data.success) {
        setNowPlayingMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to fetch movies from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNowPlayingMovies();
    else setLoading(false);
  }, [user]);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    setDateTimeSelection((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), time].filter((v, i, a) => a.indexOf(v) === i),
    }));
    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filtered = prev[date].filter((t) => t !== time);
      if (filtered.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filtered };
    });
  };

  // ✅ UPDATED FUNCTION
  const handleAddShow = async () => {
    if (!selectedMovie || !showPrice || Object.keys(dateTimeSelection).length === 0) {
      return toast.error("Please fill all fields");
    }
    try {
      setAddingShow(true);
      
      const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
        date,
        time: times,
      }));

      const { data } = await axios.post("/api/shows/add", {
        movieId: selectedMovie, // This is the numeric TMDB ID
        showPrice: Number(showPrice),
        showsInput,
      });

      if (data.success) {
        toast.success("Shows added successfully");
        setSelectedMovie(null);
        setShowPrice("");
        setDateTimeSelection({});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // ✅ FIX: Capture and display the specific backend error message
      const errorMessage = error.response?.data?.message || "Error adding show to database";
      console.error("Submission Error:", error.response?.data || error.message);
      toast.error(errorMessage);
    } finally {
      setAddingShow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Loading Movies</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Manage Showtimes</h1>
          <p className="text-gray-500 mt-2">Select a movie and configure scheduling details.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span> Now Playing
            </h2>

            {nowPlayingMovies.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <p className="text-sm font-bold uppercase tracking-widest">No movies found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-[70vh] pr-2">
                {nowPlayingMovies.map((movie) => {
                  const movieId = movie.id || movie._id;
                  return (
                    <div
                      key={movieId}
                      onClick={() => setSelectedMovie(movieId)}
                      className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedMovie === movieId
                          ? "border-primary scale-[0.98]"
                          : "border-transparent hover:border-white/20"
                      }`}
                    >
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        className="w-full aspect-[2/3] object-cover"
                        alt={movie.title}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Image' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"/>

                      {selectedMovie === movieId && (
                        <div className="absolute top-2 right-2 bg-primary p-1 rounded-full shadow-lg">
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                      )}

                      <div className="absolute bottom-0 p-3 w-full">
                        <p className="text-xs font-bold truncate">{movie.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-10">
              <h2 className="text-xl font-semibold mb-6">Configuration</h2>

              <div className="mb-6">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block">Ticket Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{currency}</span>
                  <input
                    type="number"
                    value={showPrice}
                    onChange={(e) => setShowPrice(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-primary/50 transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block">Schedule Show</label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={dateTimeInput}
                    onChange={(e) => setDateTimeInput(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm"
                  />
                  <button onClick={handleDateTimeAdd} className="bg-white text-black p-3 rounded-xl hover:bg-gray-200 transition">
                    <PlusIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-3 mb-8">
                {Object.keys(dateTimeSelection).map((date) => (
                  <div key={date}>
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">{date}</p>
                    <div className="flex flex-wrap gap-2">
                      {dateTimeSelection[date].map((time) => (
                        <div key={time} className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg text-xs">
                          <span>{time}</span>
                          <button onClick={() => handleRemoveTime(date, time)} className="hover:text-red-500 transition">
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddShow}
                disabled={addingShow}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/40 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {addingShow ? "Processing..." : "Confirm & Add Shows"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddShows;