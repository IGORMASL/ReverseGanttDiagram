import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { NotificationProvider } from "./components/NotificationProvider"
import './index.css'

// Находим <div id="root"></div> в index.html
const rootElement = document.getElementById("root")!

// Подключаем React-приложение в root
ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <NotificationProvider>
            <App />
        </NotificationProvider>
    </React.StrictMode>
)
