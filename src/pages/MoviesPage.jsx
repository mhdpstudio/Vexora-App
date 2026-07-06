import { useMemo } from "react";
import { useWatch } from "./../renderer/src/context/WatchContext";
import { useNavigate } from "react-router-dom";
import { FaHistory, FaPlay } from "react-icons/fa";
import data from "./../data/data.json";

import "./../renderer/src/assets/css/MoviesPage.css";

function formatTimeSeconds(s) {
    if (!s) return '0s';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return (h ? h + 'h ' : '') + (m ? m + 'm ' : '') + (sec ? sec + 's' : '');
}

function timeAgo(ts) {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function getSeriesProgress(entry) {
    if (!entry) return 0;

    const isEpisode = typeof entry.id === 'string' && entry.id.includes(':ep:');
    if (!isEpisode) {
        return Math.floor(((entry.lastPosition || 0) / (entry.duration || 1)) * 100);
    }

    const [seriesId, epPart] = entry.id.split(':ep:');
    const episodeNumber = parseInt(epPart, 10);
    const video = data.videos.find(v => v.id === Number(seriesId));
    const totalEpisodes = video?.episodesCount || 1;
    const episodeProgressPct = entry.duration ? ((entry.lastPosition || 0) / entry.duration) : 0;
    const overall = ((Math.max(1, Math.min(totalEpisodes, episodeNumber)) - 1) + episodeProgressPct) / totalEpisodes;
    return Math.max(0, Math.min(100, Math.round(overall * 100)));
}

function getHistoryVideoId(entry) {
    if (typeof entry.id === 'string' && entry.id.includes(':ep:')) {
        return entry.id.split(':ep:')[0];
    }
    return entry.id;
}

export default function MoviesPage() {
    const { history } = useWatch();
    const navigate = useNavigate();

    const totalItems = history.length;
    const totalWatchedSeconds = history.reduce((s, it) => s + (it.lastPosition || 0), 0);
    const lastActivity = history[0]?.lastWatchedAt;

    const continueWatching = history.filter(h => h.lastPosition && h.duration && h.lastPosition < h.duration).slice(0, 12);
    const latest = history.slice(0, 12);

    return (
        <section className="video-page">
            <div className="dashboard-wrap">
                <div className="dashboard-layout">

                    <aside className="dashboard-sidebar">

                        <div className="sidebar-card">
                            <div style={{ fontWeight: 700, fontSize: 16 }}>
                                Quick Stats
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Watched</span>
                                    <strong>{totalItems}</strong>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: 6,
                                    }}
                                >
                                    <span>Time Watched</span>
                                    <strong>{formatTimeSeconds(totalWatchedSeconds)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-card">
                            <div style={{ fontWeight: 700 }}>Actions</div>

                            <div
                                style={{
                                    marginTop: 8,
                                    display: "flex",
                                    gap: 8,
                                }}
                            >
                                <button
                                    className="bookmark-action-btn"
                                    onClick={() => navigate("/watchlist")}
                                >
                                    Bookmarks
                                </button>

                                <button
                                    className="bookmark-action-btn"
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>

                    </aside>

                    <main className="dashboard-main">

                        <div className="dashboard-header">
                            <div className="title">Dashboard</div>

                            <div style={{ color: "var(--text-secondary)" }}>
                                {lastActivity
                                    ? new Date(lastActivity).toLocaleString()
                                    : "No activity"}
                            </div>
                        </div>

                        <div className="dashboard-cards">

                            <div className="dashboard-card">
                                <div className="value">{totalItems}</div>
                                <div className="label">Watched Items</div>
                            </div>

                            <div className="dashboard-card">
                                <div className="value">
                                    {formatTimeSeconds(totalWatchedSeconds)}
                                </div>
                                <div className="label">Total Watched</div>
                            </div>

                            <div className="dashboard-card">
                                <div className="value">
                                    {lastActivity
                                        ? new Date(lastActivity).toLocaleString()
                                        : "-"}
                                </div>
                                <div className="label">Last Activity</div>
                            </div>

                        </div>

                        {/* Continue Watching */}

                        <div className="section">

                            <div className="section-title">
                                Continue Watching
                            </div>

                            <div className="continue-grid">

                                {continueWatching.length === 0 && (
                                    <div
                                        style={{
                                            padding: 24,
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        No ongoing watches
                                    </div>
                                )}

                                {continueWatching.map((item) => {

                                    const progress = getSeriesProgress(item);

                                    return (
                                        <div
                                            key={item.id}
                                            className="continue-card"
                                            onClick={() =>
                                                navigate(`/video/${getHistoryVideoId(item)}`)
                                            }
                                        >
                                            <img
                                                src={`https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${item.thumbnail}.webp`}
                                                alt={item.title}
                                            />

                                            <div className="meta">

                                                <div className="title">
                                                    {item.title}
                                                </div>

                                                <div className="progress-bar">
                                                    <span
                                                        className="progress-fill"
                                                        style={{ width: `${progress}%` }}
                                                    >
                                                        <span className="progress-text">
                                                            %{progress}
                                                        </span>
                                                    </span>
                                                </div>

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>

                        </div>

                        {/* Latest Activity */}

                        <div className="section">

                            <div className="section-title">
                                Latest Activity
                            </div>

                            <div className="latest-list">

                                {latest.length === 0 && (
                                    <div
                                        style={{
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        No recent activity
                                    </div>
                                )}

                                {latest.map((it) => (
                                    <div
                                        key={it.id}
                                        className="latest-item"
                                    >
                                        <img
                                            src={`https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${it.thumbnail}.webp`}
                                            alt={it.title}
                                        />

                                        <div className="meta">
                                            <div className="title">
                                                {it.title}
                                            </div>

                                            <div className="sub">
                                                {timeAgo(it.lastWatchedAt)}
                                            </div>
                                        </div>

                                        <div className="meta-right">
                                            {formatTimeSeconds(it.lastPosition)}
                                        </div>

                                    </div>
                                ))}

                            </div>

                        </div>

                    </main>

                </div>
            </div>
        </section>
    );
}
