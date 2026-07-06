import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/MainLayout";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./../../pages/Home";
import VideoPage from "./../../pages/VideoPage";
import MoviesPage from "./../../pages/MoviesPage";
import BookMarkPage from "./../../pages/BookMarkPage";
import AboutPage from "./../../pages/AboutPage";
import SettingsPage from "./../../pages/SettingsPage";

// هتعمل الصفحات دي بعدين
// import Movies from "./../../pages/Movies";
// import Downloads from "./../../pages/Downloads";
// import Watchlist from "./../../pages/Watchlist";
// import About from "./../../pages/About";
// import Settings from "./../../pages/Settings";

function App() {
    return (
        <BrowserRouter>

            <ScrollToTop />
            <MainLayout>

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/video/:id"
                        element={<VideoPage />}
                    />

                    <Route
                        path="/movies"
                        element={<MoviesPage />}
                    />

                    

                    <Route
                        path="/watchlist"
                        element={<BookMarkPage />}
                    />

                    <Route
                        path="/about"
                        element={<AboutPage />}
                    />

                    <Route
                        path="/settings"
                        element={<SettingsPage />}
                    />

                    {/* صفحات الـ Sidebar */}
                    {/* <Route path="/movies" element={<Movies />} />
                    <Route path="/downloads" element={<Downloads />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/settings" element={<Settings />} /> */}

                </Routes>

            </MainLayout>

        </BrowserRouter>
    );
}

export default App;