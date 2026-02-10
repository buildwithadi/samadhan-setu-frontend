import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API, {
  updateComplaintStatus,
  fetchFilteredComplaints,
} from "../../services/api";
import ComplaintCard from "../../components/ComplaintCard";
import ManageStaff from "../../components/ManageStaff";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  TrendingUp,
  Building2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Activity,
  Siren,
  Clock,
} from "lucide-react";
import { ROLES, STATUS } from "../../utils/constants";
import toast from "react-hot-toast";

const DeptDashboard = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Analytics State
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    critical: 0,
  });
  const [subDeptData, setSubDeptData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

  // Resolution Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionRemark, setResolutionRemark] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState(STATUS.RESOLVED);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      let response;

      if (user?.department) {
        response = await fetchFilteredComplaints(
          user.department,
          user.sub_department,
        );
      } else {
        response = await API.get("/complaints");
      }

      setComplaints(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error("Load Data Error:", error);
      toast.error("Failed to fetch department data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Analytics Processing (Pandas-style) ---
  const calculateStats = (data) => {
    const total = data.length;
    const resolved = data.filter((c) => c.status === "RESOLVED").length;
    const pending = total - resolved;
    const critical = data.filter(
      (c) =>
        c.ai_classification?.priority === "Critical" && c.status === "PENDING",
    ).length;

    // 1. Group By Sub-Department
    const subCounts = {};
    data.forEach((c) => {
      const sub = c.ai_classification?.sub_department || "General";
      subCounts[sub] = (subCounts[sub] || 0) + 1;
    });

    // 2. Group By Priority
    const prioCounts = { Critical: 0, Medium: 0, Low: 0 };
    data.forEach((c) => {
      const p = c.ai_classification?.priority || "Low";
      if (prioCounts[p] !== undefined) prioCounts[p]++;
    });

    // 3. Time Series (Last 7 Days)
    const dateMap = {};
    data.forEach((c) => {
      const date = new Date(c.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    const trendSeries = Object.keys(dateMap)
      .map((key) => ({ date: key, count: dateMap[key] }))
      .slice(-7);

    setStats({ total, resolved, pending, critical });
    setSubDeptData(
      Object.keys(subCounts).map((k) => ({ name: k, count: subCounts[k] })),
    );
    setPriorityData(
      Object.keys(prioCounts).map((k) => ({ name: k, count: prioCounts[k] })),
    );
    setTrendData(trendSeries);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await updateComplaintStatus(selectedComplaint._id, {
        status: resolutionStatus,
        remarks: resolutionRemark,
      });

      const updatedList = complaints.map((c) =>
        c._id === selectedComplaint._id
          ? {
              ...c,
              status: resolutionStatus,
              resolution_remarks: resolutionRemark,
            }
          : c,
      );

      setComplaints(updatedList);
      calculateStats(updatedList);
      toast.success(`Ticket marked as ${resolutionStatus}`);
      setSelectedComplaint(null);
      setResolutionRemark("");
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden selection:bg-blue-100">
      {/* 1. Sidebar - Minimalist Dark Mode */}
      <nav className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col justify-between p-5 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-100">
                Samadhan Setu
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Department Portal
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === "overview" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analytics & Feed</span>
            </button>

            {user?.role === ROLES.HEAD_DEPT && (
              <button
                onClick={() => setActiveTab("staff")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === "staff" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
              >
                <Users className="w-4 h-4" />
                <span>Manage Staff</span>
              </button>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold shadow-inner">
              {user?.role === ROLES.HEAD_DEPT ? "L2" : "L3"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p
                className="text-xs text-slate-400 truncate w-32"
                title={user?.department}
              >
                {user?.department}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 transition-colors py-2 rounded-lg hover:bg-slate-800 text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="flex-1 overflow-y-auto h-full">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <header className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                {activeTab === "overview"
                  ? "Command Center"
                  : "Staff Management"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`}
                ></span>
                <p className="text-slate-500 text-sm font-medium">
                  {activeTab === "overview"
                    ? `Live Data: ${user?.department || "All"}`
                    : "Recruitment & Hierarchy"}
                </p>
              </div>
            </div>
            {activeTab === "overview" && (
              <button
                onClick={loadData}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                title="Refresh Data"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </button>
            )}
          </header>

          {activeTab === "overview" ? (
            <div className="space-y-6 animate-in fade-in duration-500 pb-20">
              {/* KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Total Cases
                    </p>
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.total}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                      Pending
                    </p>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.pending}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between h-28 bg-red-50/30">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                      Critical
                    </p>
                    <Siren className="w-4 h-4 text-red-500 animate-pulse" />
                  </div>
                  <p className="text-3xl font-bold text-red-700">
                    {stats.critical}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      Resolved
                    </p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.resolved}
                  </p>
                </div>
              </div>

              {/* Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[350px]">
                  <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> Incoming
                    Volume (7 Days)
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tick={{ fill: "#94a3b8", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ stroke: "#e2e8f0" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[350px]">
                  <h3 className="text-sm font-bold text-slate-700 mb-6">
                    Severity Breakdown
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={priorityData}
                        layout="vertical"
                        margin={{ left: 10, right: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={80}
                          tick={{
                            fill: "#64748b",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                          {priorityData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.name === "Critical"
                                  ? "#ef4444"
                                  : entry.name === "Medium"
                                    ? "#f59e0b"
                                    : "#3b82f6"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Feed Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-slate-800 text-sm">
                      Grievance Feed
                    </h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {filteredComplaints.length} Records
                    </span>
                  </div>

                  <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
                    {["ALL", "PENDING", "RESOLVED", "REJECTED"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                            filterStatus === status
                              ? "bg-white text-slate-800 shadow-sm border border-slate-200"
                              : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 min-h-[400px]">
                  {loading ? (
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                      <p className="text-xs text-slate-400">
                        Syncing database...
                      </p>
                    </div>
                  ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                        <CheckCircle className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-slate-600 font-medium text-sm">
                        No Active Tickets
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        All clear for this filter.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredComplaints.map((complaint) => (
                        <div key={complaint._id} className="relative group">
                          <ComplaintCard complaint={complaint} />

                          {/* Resolution Overlay Button */}
                          {(user?.role === ROLES.HEAD_SUB ||
                            user?.role === ROLES.HEAD_DEPT) &&
                            complaint.status === "PENDING" && (
                              <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-white via-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-end rounded-b-xl">
                                <button
                                  onClick={() =>
                                    setSelectedComplaint(complaint)
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg shadow-lg font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Take Action
                                </button>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- MANAGED STAFF COMPONENT --- */
            <ManageStaff user={user} />
          )}
        </div>
      </main>

      {/* RESOLUTION MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Update Status
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  REF: {selectedComplaint._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase mb-1">
                  Issue Summary
                </p>
                <p className="text-sm text-slate-600 italic">
                  "{selectedComplaint.ai_classification.summary}"
                </p>
              </div>

              <form onSubmit={handleUpdateStatus}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      New Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setResolutionStatus(STATUS.RESOLVED)}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${resolutionStatus === STATUS.RESOLVED ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Resolved
                      </button>
                      <button
                        type="button"
                        onClick={() => setResolutionStatus(STATUS.REJECTED)}
                        className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${resolutionStatus === STATUS.REJECTED ? "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500" : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                      >
                        <AlertTriangle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Resolution Remarks
                    </label>
                    <textarea
                      required
                      rows="3"
                      className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
                      placeholder="e.g., 'Repairs completed by Unit 4. Verified on site.'"
                      value={resolutionRemark}
                      onChange={(e) => setResolutionRemark(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-70"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Confirm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeptDashboard;
