import { BrowserRouter, Routes, Route } from "react-router-dom"
import ClassesPage from "./pages/ClassesPage"
import AuthPage from "./pages/AuthPage"
import ProtectedRoute from "./components/ProtectedRoute"
import ClassDetailsPage from "./pages/ClassDetailsPage"

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
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

                <Route path="/auth" element={<AuthPage />} />

            </Routes>
        </BrowserRouter>

    )
}
