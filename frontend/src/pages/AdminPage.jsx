import { useState } from "react";

import AdminNotes from "../components/admin/AdminNotes";
// import AdminCategories from "../components/admin/AdminCategories";
// import AdminCollections from "../components/admin/AdminCollections";
// import AdminUsers from "../components/admin/AdminUsers";

const SECTION_NAMES = [
  "notes",
  "categories",
  "collections",
  "users",
];

function AdminPage() {
  const [section, setSection] = useState(SECTION_NAMES[0]);

  return (
    <main className="container mt-4">
      <h2 className="mb-4">Admin</h2>

      {/* Menu */}
      <div className="btn-group mb-4">
        {SECTION_NAMES.map((sectionName) => (
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
        ))}
      </div>

      {/* Content */}
      {section === "notes" && (<AdminNotes />)}
      {/*
      {section === "categories" && (<AdminCategories />)}
      {section === "collections" && (<AdminCollections />)}
      {section === "users" && (<AdminUsers />)}
      */}
    </main>
  );
}

export default AdminPage;