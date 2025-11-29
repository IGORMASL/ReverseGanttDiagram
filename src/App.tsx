import { BrowserRouter, Routes, Route } from "react-router-dom"
import ClassesPage from "./pages/ClassesPage.tsx"
import AuthPage from "./pages/AuthPage.tsx"

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/classes" element={<ClassesPage />} />
                <Route path="/auth" element={<AuthPage />} />

            </Routes>
        </BrowserRouter>

    )
}
