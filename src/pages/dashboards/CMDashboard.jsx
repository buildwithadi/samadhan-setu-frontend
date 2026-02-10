import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchComplaints } from "../../services/api";
import AddOfficial from "../../components/AddOfficial";
import OfficialsList from "../../components/OfficialsList";
import ComplaintCard from "../../components/ComplaintCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  TrendingUp,
  UserPlus,
  FileText,
} from "lucide-react";
import { ROLES, DEPARTMENTS } from "../../utils/constants";

const CMDashboard = () => {
  const { user, logout } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' or 'officials'
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const [deptData, setDeptData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await fetchComplaints();
      setComplaints(data);
      calculateStats(data);
    } catch (error) {
      console.error("Failed to load dashboard data");
    }
  };

  // --- Data Processing (Pandas-style aggregation) ---
  const calculateStats = (data) => {
    const total = data.length;
    const resolved = data.filter((c) => c.status === "RESOLVED").length;
    const pending = total - resolved;

    // Group by Department
    const deptCounts = {};
    DEPARTMENTS.forEach((d) => (deptCounts[d] = 0));

    data.forEach((c) => {
      const dept = c.ai_classification?.department;
      if (dept && deptCounts[dept] !== undefined) {
        deptCounts[dept]++;
      }
    });

    // Format for Recharts
    const chartData = Object.keys(deptCounts).map((key) => ({
      name: key.split(" ")[0], // Short name
      fullName: key,
      count: deptCounts[key],
    }));

    setStats({ total, resolved, pending });
    setDeptData(chartData);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* 1. Sidebar Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col justify-between z-20">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">
                Samadhan Setu
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                CM Secretariat
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "overview" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("officials")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "officials" ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Manage Officials</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
              CM
            </div>
            <div>
              <p className="text-sm font-medium text-white">Chief Minister</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 transition-colors py-2 rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* 2. Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        {/* Top Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              {activeTab === "overview"
                ? "State Governance Overview"
                : "Administrative Hierarchy"}
            </h2>
            <p className="text-slate-500 mt-1">
              Real-time monitoring and administrative control center.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Live System
            </span>
          </div>
        </header>

        {/* --- VIEW 1: OVERVIEW TAB --- */}
        {activeTab === "overview" ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Total Grievances
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.total}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-300 transition-all">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Pending Action
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              {/* Resolved Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-300 transition-all">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Resolved Cases
                  </p>
                  <p className="text-3xl font-bold text-slate-800">
                    {stats.resolved}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">
                    Department Performance
                  </h3>
                  <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-slate-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>{" "}
                      Grievance Load
                    </span>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData} barSize={40}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {deptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#3b82f6" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Alerts Feed */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  Critical Updates
                </h3>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                  {complaints.length > 0 ? (
                    complaints.slice(0, 4).map((c) => (
                      <div
                        key={c._id}
                        className="text-sm border-b border-slate-50 pb-3 last:border-0"
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-slate-700 truncate w-3/4">
                            {c.ai_classification?.department}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="text-slate-500 line-clamp-2 text-xs">
                          {c.ai_classification?.summary}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-10">
                      No recent alerts.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- VIEW 2: OFFICIALS MANAGEMENT TAB --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
            {/* Left Column: List of Existing Officials (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[600px]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xl">
                      Government Officials Directory
                    </h3>
                    <p className="text-slate-500 text-sm">
                      View hierarchy and contact details of Department Heads
                      (L2) and Sub-Heads (L3).
                    </p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                    {user?.district} Division
                  </div>
                </div>

                {/* Reusable Component */}
                <OfficialsList viewerRole={ROLES.ADMIN_CM} />
              </div>
            </div>

            {/* Right Column: Add New Official Form (4 cols) */}
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-t-2xl shadow-lg">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-400" />
                    Recruit Official
                  </h3>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    Create a new Department Head (L2) account. They will be
                    responsible for creating their own Sub-Dept Heads.
                  </p>
                </div>

                <div className="bg-white border-x border-b border-slate-200 p-5 rounded-b-2xl shadow-sm">
                  {/* Reusable Component */}
                  <AddOfficial creatorRole={ROLES.ADMIN_CM} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CMDashboard;
