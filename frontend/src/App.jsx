import { NavLink, Route, Routes } from "react-router-dom";

import NotesPage from "./pages/NotesPage";
import NoteDetailPage from "./pages/NoteDetailPage";
import NoteFormPage from "./pages/NoteFormPage";
import CollectionsPage from "./pages/CollectionsPage";
import AdminPage from "./pages/AdminPage";

import PageNotFound from "./components/404";

function App() {

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <NavLink className="navbar-brand ms-4 nav-link" to="/">Study Notes</NavLink>
            <ul className="navbar-nav">
              <li className="nav-item">
                <NavLink className="nav-link pe-0" to="/">My Notes</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link pe-0" to="/public">Public Notes</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link pe-0" to="/collections">Collections</NavLink>
              </li>
            </ul>
          </div>

          <NavLink className="nav-link text-light me-4"to="/admin" title="Admin">🛠️ Admin</NavLink>

        </div>
      </nav>
      <hr />

      <Routes>
        <Route path="/" element={<NotesPage />} />
        <Route path="/public" element={<NotesPage />} />

        <Route path="/notes/new" element={<NoteFormPage />} />
        <Route path="/notes/:id/" element={<NoteDetailPage />} />
        <Route path="/notes/:id/edit" element={<NoteFormPage />} />

        <Route path="/collections" element={<CollectionsPage />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
