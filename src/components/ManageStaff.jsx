import { UserPlus } from "lucide-react";
import OfficialsList from "./OfficialsList";
import AddOfficial from "./AddOfficial";
import { ROLES } from "../utils/constants";

const ManageStaff = ({ user }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      {/* Left Column: List View (8 cols) */}
      <div className="lg:col-span-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[500px]">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-xl">
              My Department Hierarchy
            </h3>
            <p className="text-slate-500 text-sm">
              Current roster of L3 officers reporting to {user?.department}.
            </p>
          </div>
          <OfficialsList
            viewerRole={ROLES.HEAD_DEPT}
            myDepartment={user?.department}
          />
        </div>
      </div>

      {/* Right Column: Add Form (4 cols) */}
      <div className="lg:col-span-4">
        <div className="sticky top-8">
          <div className="bg-indigo-900 text-white p-5 rounded-t-2xl shadow-lg">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-300" />
              Recruit L3 Officer
            </h3>
            <p className="text-indigo-200 text-xs mt-1">
              Create credentials for a Sub-Department Head (e.g., Road
              Maintenance Officer).
            </p>
          </div>
          <div className="bg-white border-x border-b border-slate-200 p-5 rounded-b-2xl shadow-sm">
            <AddOfficial
              creatorRole={ROLES.HEAD_DEPT}
              myDepartment={user?.department}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStaff;
