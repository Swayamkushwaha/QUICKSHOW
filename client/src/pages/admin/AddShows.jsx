import React, { useEffect, useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/Loading";
import { StarIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/outline";
import { kConverter } from "../../lib/kConverter";

const AddShows = () => {

  const currency = import.meta.env.VITE_CURRENCY;

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showPrice, setShowPrice] = useState("");
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [dateTimeSelection, setDateTimeSelection] = useState({});

  const fetchNowPlayingMovies = async () => {
    setNowPlayingMovies(dummyShowsData);
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;

    const [date, time] = dateTimeInput.split("T");

    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];

      if (!times.includes(time)) {
        return {
          ...prev,
          [date]: [...times, time],
        };
      }

      return prev;
    });

    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t) => t !== time);

      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [date]: filteredTimes,
      };
    });
  };

  return nowPlayingMovies.length > 0 ? (
    <>
      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>

      <div className="overflow-x-auto pb-4">
        <div className="group flex flex-wrap gap-4 mt-4 w-max">

          {nowPlayingMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setSelectedMovie(movie.id)}
              className={`relative max-w-40 cursor-pointer border-2 ${
                selectedMovie === movie.id
                  ? "border-primary"
                  : "border-transparent"
              } group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`}
            >

              <div className="relative rounded-lg overflow-hidden">

                <img
                  src={movie.poster_path}
                  alt={movie.title}
                  className="w-full object-cover brightness-90"
                />

                <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">

                  <p className="flex items-center gap-1 text-gray-400">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                  </p>

                  <p className="text-gray-300">
                    {kConverter(movie.vote_count)} Votes
                  </p>

                </div>

              </div>

              {selectedMovie === movie.id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}

              <p className="font-medium truncate mt-1">{movie.title}</p>
              <p className="text-gray-400 text-sm">{movie.release_date}</p>

            </div>
          ))}

        </div>
      </div>

      {/* Show Price */}

      <div className="mt-8">
        <label className="block text-sm font-medium mb-2">
          Show Price
        </label>

        <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">

          <p className="text-gray-400 text-sm">{currency}</p>

          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Enter show price"
            className="outline-none bg-transparent"
          />

        </div>
      </div>

      {/* Date Time Selection */}

      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">
          Select Date and Time
        </label>

        <div className="inline-flex gap-5 border border-gray-600 p-1 pl-3 rounded-lg">

          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md bg-transparent"
          />

          <button
            onClick={handleDateTimeAdd}
            className="bg-primary/80 text-white px-3 py-2 text-sm rounded-lg hover:bg-primary cursor-pointer"
          >
            Add Time
          </button>

        </div>
      </div>

      {/* Selected Showtimes */}

      <div className="mt-4 flex flex-wrap gap-3">

        {Object.keys(dateTimeSelection).map((date) =>
          dateTimeSelection[date].map((time) => (

            <div
              key={date + time}
              className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg text-sm"
            >

              <p>{date} {time}</p>

              <button
                onClick={() => handleRemoveTime(date, time)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>

            </div>

          ))
        )}

      </div>

      {/* Add Show Button */}

      <button
        className="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
      >
        Add Show
      </button>

    </>
  ) : (
    <Loading />
  );
};

export default AddShows;