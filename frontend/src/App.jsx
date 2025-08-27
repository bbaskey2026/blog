import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import BlogList from "./components/BlogList";
import Dashboard from "./components/Dashboard";
import BlogDetail from "./components/BlogDetail";
import Header from "./components/Header";
import CreateBlog from "./components/CreateBlog";
import TopicSelection from "./components/TopicSelection";
import AuthBlogList from "./components/AuthBlogList"; // ✅ Import editable blogs list
import Footer from "./components/Footer";
// PrivateRoute wrapper
const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<BlogList />} />
          <Route path="/select-interested-topics" element={<TopicSelection />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route
            path="/create-blog"
            element={
              <PrivateRoute>
                <CreateBlog />
              </PrivateRoute>
            }
          />

          {/* Editable Blogs Route */}
          <Route
            path="/edit-blogs"
            element={
              <PrivateRoute>
                <CreateBlog />/
              </PrivateRoute>
            }
          />

          {/* Dashboard with nested routes */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} /> {/* default /dashboard */}
            <Route path="my-blogs" element={<Dashboard />} /> {/* relative path */}
            <Route path="edit-blog" element={<CreateBlog />} /> {/* relative path for editor */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer></Footer>
      </AuthProvider>
    </Router>
  );
}

export default App;
