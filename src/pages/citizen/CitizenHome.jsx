import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createComplaint, fetchComplaints } from "../../services/api";
import ComplaintCard from "../../components/ComplaintCard";
import {
  Send,
  Loader2,
  LogOut,
  User,
  History,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const CitizenHome = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [newComplaintText, setNewComplaintText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Complaints on Mount
  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const { data } = await fetchComplaints();
      setComplaints(data);
    } catch (error) {
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComplaintText.trim()) return;

    setSubmitting(true);
    try {
      const { data } = await createComplaint({ text: newComplaintText });
      // Optimistic Update: Add new complaint to top of list
      setComplaints([data, ...complaints]);
      setNewComplaintText("");
      toast.success("Grievance submitted successfully.");
    } catch (error) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Glassmorphism Navbar */}
      <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight">
              Samadhan Setu
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <User className="w-4 h-4" />
              <span>{user?.name || "Citizen"}</span>
            </div>
            <button
              onClick={logout}
              className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              <span className="hidden md:block">Sign Out</span>
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        {/* 2. Hero Section: The "Zero UI" Input */}
        <section className="mb-16 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            How can we help you today?
          </h1>
          <p className="text-slate-500 mb-8 text-lg">
            Describe your grievance in detail. Our AI will route it to the
            correct department.
          </p>

          <form onSubmit={handleSubmit} className="relative group text-left">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

            <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <textarea
                value={newComplaintText}
                onChange={(e) => setNewComplaintText(e.target.value)}
                placeholder="Ex: The street light near the main market entrance in Rajpur Road has been flickering for 3 days..."
                className="w-full p-6 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 text-lg resize-none min-h-[160px]"
                disabled={submitting}
              />

              <div className="flex justify-between items-center px-6 pb-4 pt-2">
                <span className="text-xs text-slate-400 font-medium">
                  {newComplaintText.length} characters
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComplaintText.trim()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 transform active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Report</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* 3. History Section: Minimal Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-4">
            <History className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              Submission History
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-white rounded-xl border border-slate-100"
                ></div>
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-900 font-medium">
                No grievances reported yet
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Your submission history will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint._id} complaint={complaint} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CitizenHome;
