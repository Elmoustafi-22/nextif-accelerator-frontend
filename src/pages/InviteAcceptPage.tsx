import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useToastStore } from "../store/useToastStore";

const InviteAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!token) return addToast("Invalid token", "error");
    setLoading(true);
    try {
      await axiosInstance.post("/capstone/invites/accept", { token });
      addToast("Invite accepted — you've joined the team", "success");
      navigate('/capstone');
    } catch (err: any) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to accept invite", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Team Invitation</h2>
        <p className="text-gray-600 mb-6">Click the button below to accept the invitation to join the team.</p>
        <button onClick={handleAccept} disabled={loading} className="px-6 py-3 bg-indigo-600 text-white rounded-lg">
          {loading ? 'Accepting...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  );
};

export default InviteAcceptPage;
