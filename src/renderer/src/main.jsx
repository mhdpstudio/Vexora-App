import "./assets/css/main.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { BookmarkProvider } from "./context/BookmarkContext";
import { WatchProvider } from "./context/WatchContext";

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <WatchProvider>
            <BookmarkProvider>
                <App />
            </BookmarkProvider>
        </WatchProvider>

    </StrictMode>

);