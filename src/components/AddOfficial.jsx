import { useState } from "react";
import { registerUser } from "../services/api";
import { DEPARTMENTS, ROLES } from "../utils/constants";
import toast from "react-hot-toast";

// Props:
// creatorRole: Who is creating this user? (ADMIN_CM or HEAD_DEPT)
// myDepartment: If I am HEAD_DEPT, I can only create users for MY department.
const AddOfficial = ({ creatorRole, myDepartment }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    district: "",
    // Logic: If CM creates, role is Dept Head. If Dept Head creates, role is Sub Head.
    role: creatorRole === ROLES.ADMIN_CM ? ROLES.HEAD_DEPT : ROLES.HEAD_SUB,
    // Logic: If CM, they can select Dept. If Dept Head, Dept is fixed to theirs.
    department: myDepartment || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(formData);
      toast.success(`Official Created Successfully! Role: ${formData.role}`);
      // Optional: Clear form
      setFormData({ ...formData, name: "", email: "", password: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create official.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mt-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        {creatorRole === ROLES.ADMIN_CM
          ? "Create Department Head (L2)"
          : "Create Sub-Dept Head (L3)"}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <input
          name="name"
          placeholder="Official Name"
          required
          className="border p-2 rounded"
          onChange={handleChange}
          value={formData.name}
        />
        <input
          name="email"
          type="email"
          placeholder="Official Email"
          required
          className="border p-2 rounded"
          onChange={handleChange}
          value={formData.email}
        />
        <input
          name="password"
          type="password"
          placeholder="Set Password"
          required
          className="border p-2 rounded"
          onChange={handleChange}
          value={formData.password}
        />
        <input
          name="district"
          placeholder="Jurisdiction District"
          required
          className="border p-2 rounded"
          onChange={handleChange}
          value={formData.district}
        />

        {/* Department Logic */}
        {creatorRole === ROLES.ADMIN_CM ? (
          // CM can choose the Department
          <select
            name="department"
            className="border p-2 rounded md:col-span-2"
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        ) : (
          // Dept Head sees their department locked
          <div className="md:col-span-2 p-2 bg-gray-100 text-gray-600 rounded">
            Assigning to: <strong>{myDepartment}</strong>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-blue-900 text-white py-2 rounded hover:bg-blue-800"
        >
          {loading ? "Creating..." : "Create Official Account"}
        </button>
      </form>
    </div>
  );
};

export default AddOfficial;
