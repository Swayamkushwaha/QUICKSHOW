import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormat } from '../../lib/dateFormat'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const ListBookings = () => {
  const { axios, getToken, user } = useAppContext();
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const [bookings, setBookings] = useState([]);
  const [isloading, setIsLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/all-bookings", {
        headers: { Authorization: `Bearer ${await getToken()}` } // Fixed missing getToken invocation
      });
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      toast.error("Error loading bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (user) getAllBookings() }, [user]);

  return !isloading ? (
    <div className="p-4 md:p-8 text-white min-h-screen">
      <Title text1="Booking" text2="Manifest" />
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 text-gray-500 text-[10px] uppercase tracking-[0.2em] border-b border-white/10">
                <th className="p-5 font-bold">Patron</th>
                <th className="p-5 font-bold">Feature Film</th>
                <th className="p-5 font-bold">Schedule</th>
                <th className="p-5 font-bold">Seating</th>
                <th className="p-5 font-bold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {bookings.map((item, index) => (
                <tr key={index} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                  <td className="p-5 font-medium">{item.user?.name || "Anonymous"}</td>
                  <td className="p-5 text-gray-300">{item.show?.movie?.title || "Unknown Film"}</td>
                  <td className="p-5 text-xs text-gray-400 font-mono">{dateFormat(item.show?.showDateTime)}</td>
                  <td className="p-5">
                    <div className="flex flex-wrap gap-1">
                      {item.bookedSeats?.map((seat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded border border-primary/20 font-mono">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-5 text-right font-bold text-emerald-400">{currency}{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default ListBookings