import React, { useEffect, useState } from "react";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListShows = () => {
  const { axios, getToken, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-shows", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setShows(data.shows);
      }
    } catch (error) {
      toast.error("Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) getAllShows() }, [user]);

  return !loading ? (
    <div className="p-4 md:p-8 text-white min-h-screen">
      <Title text1="Operational" text2="Shows" />
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/10">
                <th className="p-5">Movie Detail</th>
                <th className="p-5">Showtime</th>
                <th className="p-5">Occupancy</th>
                <th className="p-5 text-right">Gross Revenue</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show, index) => {
                const occupancy = Object.keys(show.occupiedSeats || {}).length; //
                return (
                  <tr key={show._id || index} className="border-t border-white/5 group hover:bg-white/[0.02] transition">
                    <td className="p-5 flex items-center gap-4">
                      <img 
                        src={show.movie?.poster_path?.startsWith("http") ? show.movie.poster_path : `https://image.tmdb.org/t/p/w500${show.movie?.poster_path}`} 
                        className="h-12 w-9 object-cover rounded shadow-lg border border-white/10" 
                      />
                      <div>
                        <p className="font-bold text-sm group-hover:text-primary transition">{show.movie?.title}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{show.movie?.original_language}</p>
                      </div>
                    </td>
                    <td className="p-5 text-xs font-mono text-gray-400">{dateFormat(show.showDateTime)}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{occupancy}</span>
                        <span className="text-[10px] text-gray-500">Tickets Sold</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <p className="font-bold text-emerald-400">{currency}{occupancy * (show.showPrice || 0)}</p>
                      <p className="text-[10px] text-gray-600 font-mono tracking-tighter">@{currency}{show.showPrice} ea</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default ListShows;