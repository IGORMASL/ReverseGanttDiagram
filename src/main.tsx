import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import './index.css'

// Находим <div id="root"></div> в index.html
const rootElement = document.getElementById("root")!

// Подключаем React-приложение в root
ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
