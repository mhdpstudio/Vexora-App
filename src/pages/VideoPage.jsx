import { useMemo, useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookmarks } from "./../renderer/src/context/BookmarkContext";
import { downloadByFetching, filenameFromTitle } from "./../renderer/src/utils/downloadHelper";
import { useWatch } from "./../renderer/src/context/WatchContext";

import {
    FaStar,
    FaFilm,
    FaTv,
    FaPlay,
    FaPause,
    FaDownload,
    FaBookmark,
    FaExpand,
    FaCompress
} from "react-icons/fa";
import { FaVolumeUp, FaVolumeMute, FaRegWindowMaximize } from "react-icons/fa";

import data from "./../data/data.json";

import "./../renderer/src/assets/css/VideoPage.css";

function VideoPage() {

    const { id } = useParams();

    const videoRef = useRef(null);

    const [currentEpisode, setCurrentEpisode] = useState(0);

    const [episodesShown, setEpisodesShown] = useState(10);

    const [playing, setPlaying] = useState(true);
    const [duration, setDuration] = useState(0);
    const [currentTimeState, setCurrentTimeState] = useState(0);
    const [volume, setVolume] = useState(1);
    const [lastVolume, setLastVolume] = useState(1);
    const [showVolume, setShowVolume] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [theaterMode, setTheaterMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const navigate = useNavigate();
    const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
    const { recordProgress, history } = useWatch();

    const video = useMemo(
        () => data.videos.find(v => v.id === Number(id)),
        [id]
    );

    const episodes = useMemo(() => {
        return Array.from(
            { length: video?.episodesCount || 1 },
            (_, i) => ({
                id: i + 1,
                title:
                    (video?.episodesCount || 1) === 1
                        ? "Movie"
                        : `Episode ${i + 1}`,
                video:
                    `${video.videoFolder}${i + 1}.${video.videoExtension}`
            })
        );
    }, [video]);

    const type =
        (video?.episodesCount || 1) === 1
            ? "movie"
            : "series";

    if (!video) {

        return (

            <div className="video-not-found">

                <h1>Video Not Found</h1>

            </div>

        );

    }
    const capitalize = text =>
        text.charAt(0).toUpperCase() + text.slice(1);

    const toggleMute = () => {
        if (volume > 0) {
            setLastVolume(volume);
            setVolume(0);
        } else {
            setVolume(lastVolume || 1);
        }
    };

    const currentVideo = episodes[currentEpisode];

    const [isVideoLoading, setIsVideoLoading] = useState(true);

    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.volume = volume;
        // disable Picture-in-Picture where supported
        try {
            videoRef.current.disablePictureInPicture = true;
        } catch (e) { }
    }, [volume]);

    // if this is a series, try to pick the most recently watched episode on mount
    useEffect(() => {
        if (!video) return;
        if ((video?.episodesCount || 1) <= 1) return;
        try {
            const latestEpisodeHistory = history.find(h => typeof h.id === 'string' && h.id.startsWith(`${video.id}:ep:`));
            if (latestEpisodeHistory) {
                const parts = String(latestEpisodeHistory.id).split(':ep:');
                const epNum = parseInt(parts[1], 10) - 1;
                if (!Number.isNaN(epNum) && epNum >= 0 && epNum < (video.episodesCount || 1)) {
                    setCurrentEpisode(epNum);
                }
            }
        } catch (e) { }
    }, [video?.id, history]);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setPlaying(true);
        } else {
            videoRef.current.pause();
            setPlaying(false);
        }
    };

    const toggleTheater = () => {
        setTheaterMode(t => !t);
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        const onFs = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onFs);
        return () => document.removeEventListener("fullscreenchange", onFs);
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            }
            if (e.key.toLowerCase() === 'f') {
                toggleFullscreen();
            }
            if (e.key.toLowerCase() === 't') {
                toggleTheater();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [duration]);

    // show loading when switching episodes
    useEffect(() => {
        setIsVideoLoading(true);
    }, [currentEpisode]);

    useEffect(() => {
        setCurrentEpisode(0);
        setEpisodesShown(10);
    }, [video.id]);
    // declarative handlers for video buffering/playing states
    const handleCanPlay = () => {
        setIsVideoLoading(false);
        setPlaying(true);
    };

    const handlePlaying = () => setIsVideoLoading(false);
    const handleWaiting = () => setIsVideoLoading(true);

    const onLoadedMetadata = () => {
        if (!videoRef.current) return;
        const dur = videoRef.current.duration || 0;
        setDuration(dur);
        setCurrentTimeState(videoRef.current.currentTime || 0);
        // try resume from history
        try {
            let entry;
            if (type === 'series') {
                const epId = `${video.id}:ep:${currentEpisode + 1}`;
                entry = history.find(h => h.id === epId);
            } else {
                entry = history.find(h => h.id === video.id);
            }

            if (entry && entry.lastPosition && entry.lastPosition < dur) {
                videoRef.current.currentTime = entry.lastPosition;
                setCurrentTimeState(entry.lastPosition);
            }
        } catch (e) { }
        // metadata loaded -> stop loading state
        setIsVideoLoading(false);
    };

    const onTimeUpdate = () => {
        if (!videoRef.current) return;
        const t = videoRef.current.currentTime || 0;
        setCurrentTimeState(t);
        // record progress periodically (throttle)
        try {
            if (!videoRef.current._lastRecordAt) videoRef.current._lastRecordAt = 0;
            const now = Date.now();
            if (now - videoRef.current._lastRecordAt > 5000) { // every 5s
                const entryId = type === 'series' ? `${video.id}:ep:${currentEpisode + 1}` : video.id;
                const entryTitle = type === 'series' ? `${video.title} — ${episodes[currentEpisode].title}` : video.title;
                recordProgress({ id: entryId, title: entryTitle, thumbnail: video.thumbnail, currentTime: Math.floor(t), duration: Math.floor(duration) });
                videoRef.current._lastRecordAt = now;
            }
        } catch (e) { }
    };

    const seekTo = (e) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        videoRef.current.currentTime = pct * duration;
        setCurrentTimeState(videoRef.current.currentTime);
    };

    const formatTime = (t = 0) => {
        const hrs = Math.floor(t / 3600);
        const mins = Math.floor((t % 3600) / 60);
        const secs = Math.floor(t % 60);
        return (hrs > 0 ? `${hrs}:` : "") + `${hrs > 0 ? String(mins).padStart(2, '0') : mins}:${String(secs).padStart(2, '0')}`;
    };

    const episodeProgress = useMemo(() => {
        const progressMap = {};

        if (!video) return progressMap;

        history.forEach(entry => {
            if (typeof entry.id !== "string") return;
            if (!entry.id.startsWith(`${video.id}:ep:`)) return;

            const epNumber = parseInt(
                entry.id.split(":ep:")[1],
                10
            );

            if (Number.isNaN(epNumber)) return;

            const progress = entry.duration
                ? ((entry.lastPosition || 0) / entry.duration) * 100
                : 0;

            progressMap[epNumber] = Math.min(
                100,
                Math.round(progress)
            );
        });

        return progressMap;
    }, [history, video]);

    const recommended = useMemo(() => {
        const others = data.videos.filter(v => v.id !== video.id);
        return others.sort(() => Math.random() - 0.5).slice(0, 6);
    }, [video.id]);

    return (

        <section className={`video-page ${theaterMode ? 'theater' : ''}`}>

            <div className="player-layout">

                <div className="player-section">

                    <div className="video-player" ref={containerRef}>
                        <div
                            className="video-wrapper"
                            onMouseEnter={() => setShowControls(true)}
                            onMouseLeave={() => setShowControls(false)}
                        >
                            <video
                                key={currentEpisode}
                                ref={videoRef}
                                src={currentVideo.video}
                                autoPlay
                                playsInline
                                preload="metadata"
                                poster={`https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${video.thumbnail}.webp`}
                                onPlay={() => setPlaying(true)}
                                onPause={() => setPlaying(false)}
                                onCanPlay={handleCanPlay}
                                onPlaying={handlePlaying}
                                onWaiting={handleWaiting}
                                onClick={togglePlay}
                                onLoadedMetadata={onLoadedMetadata}
                                onTimeUpdate={onTimeUpdate}
                                disablePictureInPicture
                                controlsList="nodownload noremoteplayback"
                            />

                            {isVideoLoading && (
                                <div className="video-loading">
                                    <div className="spinner" />
                                    <div className="loading-text">Loading…</div>
                                </div>
                            )}

                            {!playing && (
                                <button className="center-play" onClick={togglePlay} aria-label="Play">
                                    <FaPlay />
                                </button>
                            )}

                            <div className={`custom-controls ${showControls ? 'visible' : ''}`}>
                                <div className="progress" onClick={(e) => {
                                    e.stopPropagation();
                                    seekTo(e);
                                }} role="slider" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={currentTimeState}>
                                    <div className="progress-filled" style={{ width: `${duration ? (currentTimeState / duration) * 100 : 0}%` }} />
                                </div>

                                <div className="control-bar">
                                    <button
                                        className="play-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            togglePlay();
                                        }}
                                        aria-label="Play/Pause"
                                    >
                                        {playing ? <FaPause /> : <FaPlay />}
                                    </button>

                                    <div className="time">{formatTime(currentTimeState)} / {formatTime(duration)}</div>

                                    <div className="spacer" />

                                    <div className="volume-container" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                                        <button
                                            className="volume-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMute();
                                            }}
                                            aria-label="Mute / Unmute"
                                        >
                                            {volume > 0 ? <FaVolumeUp /> : <FaVolumeMute />}
                                        </button>
                                        <div className={`volume-popup ${showVolume ? 'show' : ''}`}>
                                            <input className="volume-slider" type="range" min={0} max={1} step={0.01} value={volume} onClick={(e) => e.stopPropagation()} onChange={(e) => {
                                                const value = parseFloat(e.target.value);
                                                setVolume(value);

                                                if (value > 0) {
                                                    setLastVolume(value);
                                                }
                                            }} />
                                        </div>
                                    </div>

                                    <button className="theater-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTheater();
                                    }} title="Theater (T)"><FaRegWindowMaximize /></button>

                                    <button className="fullscreen-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFullscreen();
                                    }} title="Fullscreen (F)">{isFullscreen ? <FaCompress /> : <FaExpand />}</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="video-details">

                        <div className="video-header">

                            <div>

                                <h1 className="Video-name">
                                    {video.title}
                                </h1>

                                <div className="video-meta">

                                    <span>
                                        <FaStar />
                                        {video.rating}
                                    </span>

                                    <span>
                                        {type === "movie" ? <FaFilm /> : <FaTv />}
                                        {capitalize(type)}
                                    </span>

                                    <span>
                                        {video.date}
                                    </span>

                                    {video.categories.map(category => (
                                        <span key={category}>
                                            {capitalize(category)}
                                        </span>
                                    ))}

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="video-actions">


                        <button className={`bookmark-btn ${isBookmarked(video.id) ? 'bookmarked' : ''}`} onClick={() => {
                            if (isBookmarked(video.id)) {
                                removeBookmark(video.id);
                            } else {
                                addBookmark({
                                    id: video.id,
                                    title: video.title,
                                    thumbnail: video.thumbnail,
                                    date: video.date,
                                    rating: video.rating,
                                    type
                                })
                            }
                        }}>

                            <FaBookmark />

                            {isBookmarked(video.id) ? 'Bookmarked' : 'Add To Bookmarks'}

                        </button>

                        <button
                            className="download-btn"
                            onClick={async (e) => {
                                e.preventDefault();
                                const url = currentVideo.video;
                                const fname = filenameFromTitle(video.title, url?.split('.').pop()?.split('?')[0] || 'mp4');
                                await downloadByFetching(url, fname);
                            }}
                        >

                            <FaDownload />

                        </button>

                    </div>

                    <div className="video-description">

                        <h3>

                            Description

                        </h3>

                        <p>

                            {

                                video.description ??

                                "No description available."

                            }

                        </p>

                    </div>

                    <div className="video-extra">

                        <div>

                            <span>

                                Released

                            </span>

                            <strong>

                                {video.date}

                            </strong>

                        </div>

                        <div>

                            <span>

                                Added

                            </span>

                            <strong>

                                {video.time}

                            </strong>

                        </div>

                        <div>

                            <span>

                                Episodes

                            </span>

                            <strong>

                                {video.episodesCount}

                            </strong>

                        </div>

                        <div>

                            <span>

                                Category

                            </span>

                            <strong>

                                {capitalize(video.categories[0])}

                            </strong>

                        </div>

                    </div>

                </div>



                <aside className="side-column">
                    {type === "series" && (
                        <div className="episodes">
                            <h2>Episodes</h2>
                            {episodes.slice(0, episodesShown).map((episode, index) => {
                                const progress = episodeProgress[episode.id] || 0;
                                const isCompleted = progress >= 100;
                                return (
                                    <button
                                        key={episode.id}
                                        className={`episode-card ${currentEpisode === index ? "active" : ""}`}
                                        onClick={() => setCurrentEpisode(index)}
                                    >
                                        <div className="episode-number">EP {episode.id}</div>
                                        <div className="episode-content">
                                            <div className="episode-title">{episode.title}</div>
                                            <div className="episode-progress-wrapper">
                                                <div className="episode-progress-track">
                                                    <div className="episode-progress-fill" style={{ width: `${progress}%` }} />
                                                </div>
                                                {isCompleted && <div className="episode-progress-complete">Completed</div>}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            {episodes.length > episodesShown && (
                                <div style={{ paddingTop: 8 }}>
                                    <button
                                        className="episode-more"
                                        onClick={() => setEpisodesShown(s => Math.min(episodes.length, s + 10))}
                                    >
                                        More
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </aside>

            </div>

            <div className="recommended recommended-below">
                <h2>Recommended</h2>
                <div className="recommended-list">
                    {recommended.map(r => (
                        <div key={r.id} className="recommended-item" onClick={() => navigate(`/video/${r.id}`)}>
                            <img src={`https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${r.thumbnail}.webp`} alt={r.title} />
                            <div className="meta">
                                <div style={{ fontWeight: 700 }}>{r.title}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{r.categories?.[0]}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section >

    );

}

export default VideoPage; 