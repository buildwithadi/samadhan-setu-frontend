import {
  Calendar,
  MapPin,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";

const ComplaintCard = ({ complaint }) => {
  // 1. Status Configuration (Professional Blue/Slate Theme)
  const getStatusConfig = (status) => {
    switch (status) {
      case "RESOLVED":
        return {
          icon: CheckCircle2,
          classes: "bg-blue-600 text-white border-blue-600",
          label: "Resolved",
        };
      case "REJECTED":
        return {
          icon: AlertCircle,
          classes: "bg-slate-100 text-slate-500 border-slate-200",
          label: "Closed",
        };
      default: // PENDING
        return {
          icon: Clock,
          classes: "bg-blue-50 text-blue-700 border-blue-100",
          label: "In Progress",
        };
    }
  };

  const statusConfig = getStatusConfig(complaint.status);
  const StatusIcon = statusConfig.icon;

  // 2. Date Formatter
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="group relative bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Decorative Top Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header: Date & ID */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 mr-1.5" />
          {formatDate(complaint.createdAt)}
        </div>

        {/* Priority Dot (Only if Critical) */}
        {complaint.ai_classification?.priority === "Critical" && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
        )}
      </div>

      {/* Body: AI Summary & Raw Text */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-700 transition-colors">
          {complaint.ai_classification?.summary || "Analyzing Complaint..."}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
          {complaint.raw_text}
        </p>
      </div>

      {/* Footer: Metadata & Status */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        {/* Department Tag */}
        <div className="flex items-center text-slate-600 text-xs font-medium bg-slate-50 px-2.5 py-1.5 rounded-md">
          <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
          {complaint.ai_classification?.department || "Processing"}
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${statusConfig.classes}`}
        >
          <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
          {statusConfig.label}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
