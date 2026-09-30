import { useState } from "react";
import AdminNotes from "../components/admin/AdminNotes";

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
            {sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}
          </button>
        )}
      </div>

      {/* Content */}
      <AdminNotes
        sectionName={section}
        columns={sectionConfig.columns}
      />
    </main>
  );
}

export default AdminPage;