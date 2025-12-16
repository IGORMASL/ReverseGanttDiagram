import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import ClassesPage from "./pages/ClassesPage"
import AuthPage from "./pages/AuthPage"
import ProtectedRoute from "./components/ProtectedRoute"
import ClassDetailsPage from "./pages/ClassDetailsPage"
import ProjectPage from "./pages/ProjectPage"

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* корневой маршрут: в зависимости от наличия токена отправляем на /classes или /auth */}
                <Route
                    path="/"
                    element={
                        localStorage.getItem("token")
                            ? <Navigate to="/classes" replace />
                            : <Navigate to="/auth" replace />
                    }
                />
                <Route
                    path="/classes"
                    element={
                        <ProtectedRoute>
                            <ClassesPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/classes/:classId"
                    element={
                        <ProtectedRoute>
                            <ClassDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/classes/:classId/projects/:projectId"
                    element={
                        <ProtectedRoute>
                            <ProjectPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/auth" element={<AuthPage />} />

            </Routes>
        </BrowserRouter>

    )
}
