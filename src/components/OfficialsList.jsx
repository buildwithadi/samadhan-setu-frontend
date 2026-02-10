import { useState, useEffect } from "react";
import { fetchUsersByRole } from "../services/api"; // Updated Import
import { ROLES } from "../utils/constants";
import {
  Mail,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  MapPin,
  Building2,
  Loader2,
} from "lucide-react";

const OfficialsList = ({ viewerRole, myDepartment }) => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      // 1. Fetch both levels of hierarchy in parallel
      // This is like: df_heads = get_heads(); df_subs = get_subs();
      const [headsResponse, subsResponse] = await Promise.all([
        fetchUsersByRole(ROLES.HEAD_DEPT),
        fetchUsersByRole(ROLES.HEAD_SUB),
      ]);

      // 2. Merge them into one list
      // Like: df = pd.concat([df_heads, df_subs])
      const allOfficials = [...headsResponse.data, ...subsResponse.data];
      setOfficials(allOfficials);
    } catch (error) {
      console.error("Failed to fetch officials hierarchy", error);
      // Optional: Handle error gracefully (e.g., if user lacks permission for one role)
    } finally {
      setLoading(false);
    }
  };

  // --- EXISTING LOGIC: Group By Department ---
  const groupedData = officials.reduce((acc, user) => {
    // Filter: If I am Dept Head, ONLY show my department
    if (viewerRole === ROLES.HEAD_DEPT && user.department !== myDepartment)
      return acc;

    const dept = user.department || "Unassigned";
    if (!acc[dept]) acc[dept] = { head: null, subHeads: [] };

    if (user.role === ROLES.HEAD_DEPT) {
      acc[dept].head = user;
    } else if (user.role === ROLES.HEAD_SUB) {
      acc[dept].subHeads.push(user);
    }
    return acc;
  }, {});

  if (loading)
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-4">
      {Object.entries(groupedData).map(([deptName, { head, subHeads }]) => (
        <div
          key={deptName}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          {/* HEADER: Department Name & Head Info */}
          <div
            className="p-4 bg-slate-50 flex items-center justify-between cursor-pointer select-none"
            onClick={() =>
              setExpandedDept(expandedDept === deptName ? null : deptName)
            }
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{deptName}</h4>
                {head ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Shield className="w-3 h-3 text-blue-600" />
                    <span className="font-medium text-blue-700">
                      Head: {head.name}
                    </span>
                    <span className="text-slate-300">|</span>
                    <Mail className="w-3 h-3" /> {head.email}
                  </div>
                ) : (
                  <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                    L2 Position Vacant
                  </span>
                )}
              </div>
            </div>

            {/* Chevron Logic: CM can toggle. Dept Head sees static view (or auto-expanded) */}
            {viewerRole === ROLES.ADMIN_CM &&
              (expandedDept === deptName ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
              ))}
          </div>

          {/* BODY: Sub-Heads List */}
          {/* Logic: If I am Dept Head, ALWAYS show. If CM, show only if Expanded. */}
          {(viewerRole === ROLES.HEAD_DEPT || expandedDept === deptName) && (
            <div className="border-t border-slate-100 bg-white p-4 animate-in slide-in-from-top-2 duration-200">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-2">
                Sub-Department Officers (L3)
              </h5>

              {subHeads.length > 0 ? (
                <div className="grid gap-3">
                  {subHeads.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-1.5 rounded-full">
                          <User className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {sub.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" /> {sub.district}
                          </div>
                        </div>
                      </div>
                      <a
                        href={`mailto:${sub.email}`}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-100"
                      >
                        <Mail className="w-3 h-3" />
                        {sub.email}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic pl-2">
                  No Sub-Department heads appointed yet.
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      {Object.keys(groupedData).length === 0 && !loading && (
        <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-300">
          No officials found in hierarchy.
        </div>
      )}
    </div>
  );
};

export default OfficialsList;
