import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Confetti from "react-confetti";

const Loading = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // ✅ Safety Check: Only redirect if this is a payment success flow
    const isPaymentRedirect = location.pathname.includes('/loading/my-bookings');

    if (isPaymentRedirect) {
      const processTimer = setTimeout(() => {
        setIsCompleted(true);
      }, 2000);

      const redirectTimer = setTimeout(() => {
        navigate("/my-bookings");
      }, 5000);

      return () => {
        clearTimeout(processTimer);
        clearTimeout(redirectTimer);
      };
    }
  }, [navigate, location]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#020202] text-white overflow-hidden">
      {isCompleted && <Confetti numberOfPieces={150} recycle={false} colors={['#FF385C', '#ffffff']} />}
      <div className="relative flex flex-col items-center">
        {!isCompleted ? (
          <>
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-black uppercase tracking-[0.2em] animate-pulse">Processing...</p>
          </>
        ) : (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)] mb-6">
              <CheckCircle className="w-12 h-12 text-white stroke-[3px]" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Action Confirmed!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;