import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookmarks } from "./../context/BookmarkContext";
import { downloadByFetching, filenameFromTitle } from "./../utils/downloadHelper";

import data from "./../../../data/data.json";

import "./../assets/css/HeroBanner.css";

import {
    FaPlay,
    FaStar,
    FaBookmark,
    FaDownload
} from "react-icons/fa";

function HeroBanner() {

    const navigate = useNavigate();

    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

    const { featured, videos } = data;

    const featuredVideos = useMemo(() => {

        return featured
            .map(id => videos.find(video => video.id === id))
            .filter(Boolean);

    }, [featured, videos]);

    const [current, setCurrent] = useState(0);

    const [animate, setAnimate] = useState(true);

    const [paused, setPaused] = useState(false);

    const [isFocused, setIsFocused] = useState(true);

    useEffect(() => {

        const handleFocus = () => setIsFocused(true);

        const handleBlur = () => setIsFocused(false);

        window.addEventListener("focus", handleFocus);

        window.addEventListener("blur", handleBlur);

        return () => {

            window.removeEventListener("focus", handleFocus);

            window.removeEventListener("blur", handleBlur);

        };

    }, []);

    useEffect(() => {

        if (paused || !isFocused || featuredVideos.length <= 1) return;

        const interval = setInterval(() => {

            setAnimate(false);

            setTimeout(() => {

                setCurrent(prev => (prev + 1) % featuredVideos.length);

                setAnimate(true);

            }, 80);

        }, 6000);

        return () => clearInterval(interval);

    }, [paused, isFocused, featuredVideos.length]);

    const item = featuredVideos[current];

    if (!item) return null;

    return (

        <div className="main-banner">

            <section

                className="hero-banner"

                style={{
                    backgroundImage: `url(https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${item.thumbnail}-bg.webp)`
                }}

                onMouseEnter={() => setPaused(true)}

                onMouseLeave={() => setPaused(false)}

            >

                <div className="hero-overlay">

                    <div

                        key={item.id}

                        className={`hero-content ${animate ? "show" : ""}`}

                    >

                        <span className="hero-tag">

                            Featured

                        </span>

                        <h1>

                            {item.title}

                        </h1>

                        <div className="hero-meta">

                            <span>

                                <FaStar />

                                {item.rating ?? "N/A"}

                            </span>

                            {item.categories.map(category => (

                                <span key={category}>

                                    {category.charAt(0).toUpperCase() + category.slice(1)}

                                </span>

                            ))}
                        </div>

                        <p>

                            {item.description ?? "No description available."}

                        </p>

                        <div className="hero-buttons">

                            <button

                                className="watch-btn"

                                onClick={() => navigate(`/video/${item.id}`)}

                            >

                                <FaPlay />

                                Watch Now

                            </button>

                            <button className={`favorite-btn ${isBookmarked(item.id) ? 'bookmarked' : ''}`} onClick={() => {
                                if (isBookmarked(item.id)) {
                                    removeBookmark(item.id);
                                } else {
                                    addBookmark({
                                        id: item.id,
                                        title: item.title,
                                        thumbnail: item.thumbnail,
                                        date: item.date,
                                        rating: item.rating,
                                        type: item.type
                                    });
                                }
                            }}>

                                <FaBookmark />

                                {isBookmarked(item.id) ? 'Bookmarked' : 'Add To Bookmarks'}

                            </button>

                            <button
                                className="download-btn"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    const url = item.episodes?.[0]?.video || item.episodes?.[0];
                                    const fname = filenameFromTitle(item.title, url?.split('.').pop()?.split('?')[0] || 'mp4');
                                    await downloadByFetching(url, fname);
                                }}
                            >
                                <FaDownload />
                            </button>

                        </div>

                    </div>

                </div>

                <div className="hero-dots">

                    {

                        featuredVideos.map((_, index) => (

                            <button

                                key={index}

                                className={current === index ? "active" : ""}

                                onClick={() => {

                                    setAnimate(false);

                                    setTimeout(() => {

                                        setCurrent(index);

                                        setAnimate(true);

                                    }, 80);

                                }}

                            />

                        ))

                    }

                </div>

            </section>

        </div>

    );

}

export default HeroBanner;