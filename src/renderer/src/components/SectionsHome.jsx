import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "./../../../data/data.json";
import "./../assets/css/SectionsHome.css";
import { FaChevronLeft, FaChevronRight, FaClock } from "react-icons/fa";

function CardImage({ src, alt }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="image-wrapper">
            {!loaded && !error && (
                <div className="image-loader">Loading...</div>
            )}
            {error && (
                <div className="image-error">Image failed</div>
            )}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
                className={loaded ? 'image-loaded' : 'image-hidden'}
            />
        </div>
    );
}

function SectionsHome() {

    const navigate = useNavigate();

    const { categories, videos } = data;

    const rowRefs = useRef({});

    // يحول التاريخ + الوقت إلى Date
    const getVideoDate = (video) => {
        return new Date(`${video.date}T${video.time}:00`);
    };

    // ترتيب حسب التاريخ والوقت
    const recentVideos = useMemo(() => {
        return [...videos].sort(
            (a, b) => getVideoDate(b) - getVideoDate(a)
        );
    }, [videos]);

    const getCategoryVideos = (categoryId) => {

        return [...videos]
            .filter(video => video.categories.includes(categoryId))
            .sort((a, b) => getVideoDate(b) - getVideoDate(a));

    };

    const isNewVideo = (video) => {
        const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

        return Date.now() - getVideoDate(video).getTime() <= THREE_DAYS;
    };

    const scrollRow = (key, direction) => {

        const row = rowRefs.current[key];

        if (!row) return;

        const card = row.querySelector(".video-card, .more-card");

        if (!card) return;

        const gap = 18;

        row.scrollBy({
            left: (card.offsetWidth + gap) * 3 * direction,
            behavior: "smooth"
        });

    };

    return (
        <div className="sections-home">

            {/* Recently Added */}

            <section className="section">

                <div className="section-header">

                    <h2><FaClock /> Recently Added</h2>

                    <div className="section-arrows">

                        <button onClick={() => scrollRow("recent", -1)}>
                            <FaChevronLeft />
                        </button>

                        <button onClick={() => scrollRow("recent", 1)}>
                            <FaChevronRight />
                        </button>

                    </div>

                </div>

                <div
                    className="cards-row"
                    ref={(el) => (rowRefs.current.recent = el)}
                >

                    {recentVideos.slice(0, 25).map(video => (

                        <div
                            className="video-card"
                            key={video.id}
                            onClick={() => navigate(`/video/${video.id}`)}
                        >

                            {isNewVideo(video) && (
                                <div className="new-badge">
                                    NEW
                                </div>
                            )}

                            <CardImage
                                src={`https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${video.thumbnail}.webp`}
                                alt={video.title}
                            />

                            <div className="overlay">
                                <span>{video.title}</span>
                            </div>

                        </div>

                    ))}

                    {recentVideos.length > 25 && (

                        <div className="more-card">
                            More
                        </div>

                    )}

                </div>

            </section>

            {/* Categories */}

            {categories.map(category => {

                const list = getCategoryVideos(category.id);

                return (

                    <section
                        className="section"
                        key={category.id}
                    >

                        <div className="section-header">

                            <h2>{category.title}</h2>

                            <div className="section-arrows">

                                <button onClick={() => scrollRow(category.id, -1)}>
                                    <FaChevronLeft />
                                </button>

                                <button onClick={() => scrollRow(category.id, 1)}>
                                    <FaChevronRight />
                                </button>

                            </div>

                        </div>

                        <div
                            className="cards-row"
                            ref={(el) => (rowRefs.current[category.id] = el)}
                        >

                            {list.slice(0, 25).map(video => (

                                <div
                                    className="video-card"
                                    key={video.id}
                                    onClick={() => navigate(`/video/${video.id}`)}
                                >

                                    {isNewVideo(video) && (
                                        <div className="new-badge">
                                            NEW
                                        </div>
                                    )}

                                    <CardImage
                                        src={`https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${video.thumbnail}.webp`}
                                        alt={video.title}
                                    />

                                    <div className="overlay">
                                        <span>{video.title}</span>
                                    </div>

                                </div>

                            ))}

                            {list.length > 25 && (

                                <div className="more-card">
                                    More
                                </div>

                            )}

                        </div>

                    </section>

                );

            })}

        </div>
    );
}

export default SectionsHome;