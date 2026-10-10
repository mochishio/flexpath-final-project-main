import { capitalize } from "../utils/formatText";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import AdminTable from "../components/admin/AdminTable";

const SECTIONS = {
  // exclude isPublic column

  "notes": {
    columns: [
      "id",
      "title",
      "username",
      "createdAt",
      "updatedAt",
    ]
  },
  "categories": {
    columns: [
      "id",
      "name",
      "createdAt",
      "updatedAt",
    ]
  },
  "collections": {
    columns: [
      "id",
      "name",
      "username",
      "createdAt",
      "updatedAt",
    ]
  }
};

function AdminPage() {
  const [section, setSection] = useState(Object.keys(SECTIONS)[0]);
  const sectionConfig = SECTIONS[section];

  const { currentUserRoles, loading } = useAuth();
  const isAdmin = currentUserRoles.includes("ADMIN");

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/404" replace />;
  }

  return (
    <main className="container mt-4">
      <h2 className="mb-4">Admin</h2>

      {/* Menu */}
      <div className="btn-group mb-4">
        {Object.keys(SECTIONS).map((sectionName) =>
          <button
            key={sectionName}
            type="button"
            className={
              section === sectionName
                ? "btn btn-dark"
                : "btn btn-outline-dark"
            }
            onClick={() => setSection(sectionName)}
          >
            {capitalize(sectionName)}
          </button>
        )}
      </div>

      {/* Content */}
      <AdminTable
        sectionName={section}
        columns={sectionConfig.columns}
      />
    </main>
  );
}

export default AdminPage;