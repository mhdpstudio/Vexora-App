import { useEffect, useMemo, useState } from "react";
import { FaCog, FaMoon, FaSun, FaPalette, FaSlidersH, FaSyncAlt, FaDownload } from "react-icons/fa";
import pkg from "./../../package.json";
import "./../renderer/src/assets/css/SettingsPage.css";

const ACCENT_OPTIONS = [
    { name: "Green", value: "#5fc945" },
    { name: "Sky", value: "#38bdf8" },
    { name: "Purple", value: "#a855f7" },
    { name: "Pink", value: "#ec4899" },
];

const LOCAL_STORAGE_KEY = "videos-app-settings";
const UPDATE_MANIFEST_URL = "https://raw.githubusercontent.com/mhdpstudio/Vexora-App/main/update.json";

const defaultSettings = {
    theme: "dark",
    accent: "#5fc945",
    hover: "#4fb137",
    general: {
        autoResume: true,
        safeMode: false,
        autoUpdate: true,
    },
};

function loadSettings() {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        return stored ? JSON.parse(stored) : defaultSettings;
    } catch (error) {
        return defaultSettings;
    }
}

function saveSettings(settings) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

export default function SettingsPage() {
    const [settings, setSettings] = useState(loadSettings);
    const [activeSection, setActiveSection] = useState("appearance");
    const [updateStatus, setUpdateStatus] = useState("Latest version installed");
    const [checkingUpdates, setCheckingUpdates] = useState(false);
    const [lastChecked, setLastChecked] = useState(() => new Date().toLocaleString());

    useEffect(() => {
        saveSettings(settings);
        document.documentElement.dataset.theme = settings.theme;
        document.documentElement.style.setProperty("--primary", settings.accent);
        document.documentElement.style.setProperty("--primary-hover", settings.hover);
    }, [settings]);

    const accentLabel = useMemo(() => {
        const option = ACCENT_OPTIONS.find((item) => item.value === settings.accent);
        return option?.name || "Custom";
    }, [settings.accent]);

    function updateSetting(key, value) {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }

    function updateGeneral(key, value) {
        setSettings((prev) => ({
            ...prev,
            general: {
                ...prev.general,
                [key]: value,
            },
        }));
    }

    function resetDefaults() {
        setSettings(defaultSettings);
    }

    function compareVersions(current, latest) {
        const toNumbers = (value) => value.split(".").map((item) => parseInt(item, 10) || 0);
        const [curMajor, curMinor, curPatch] = toNumbers(current);
        const [latMajor, latMinor, latPatch] = toNumbers(latest);

        if (latMajor !== curMajor) return latMajor > curMajor;
        if (latMinor !== curMinor) return latMinor > curMinor;
        return latPatch > curPatch;
    }

    async function checkUpdates() {
        setCheckingUpdates(true);
        setUpdateStatus("Checking for updates...");

        try {
            const response = await fetch(UPDATE_MANIFEST_URL, { cache: "no-store" });
            if (!response.ok) throw new Error("Unable to fetch update manifest");

            const manifest = await response.json();
            const latestVersion = manifest.version || "0.0.0";
            const isUpdateAvailable = compareVersions(pkg.version, latestVersion);

            setLastChecked(new Date().toLocaleString());
            setUpdateStatus(isUpdateAvailable ? `Update available: ${latestVersion}` : `App is up to date (${pkg.version})`);

            if (manifest.notes) {
                setCheckingUpdates(false);
                return manifest;
            }

            return manifest;
        } catch (error) {
            setUpdateStatus("Unable to check updates. Please check your connection.");
            setCheckingUpdates(false);
            return null;
        } finally {
            setCheckingUpdates(false);
        }
    }

    return (
        <section className="settings-page">
            <aside className="settings-sidebar">
                <div className="settings-sidebar-title">Settings</div>
                <button
                    type="button"
                    className={`settings-sidebar-item ${activeSection === "general" ? "active" : ""}`}
                    onClick={() => setActiveSection("general")}
                >
                    <FaSlidersH />
                    General
                </button>
                <button
                    type="button"
                    className={`settings-sidebar-item ${activeSection === "appearance" ? "active" : ""}`}
                    onClick={() => setActiveSection("appearance")}
                >
                    <FaPalette />
                    Appearance
                </button>
                <button
                    type="button"
                    className={`settings-sidebar-item ${activeSection === "updates" ? "active" : ""}`}
                    onClick={() => setActiveSection("updates")}
                >
                    <FaSyncAlt />
                    Updates
                </button>
            </aside>

            <div className="settings-main">
                <div className="settings-header">
                    <div className="settings-header-left">
                        <div className="settings-header-icon">
                            <FaCog />
                        </div>
                        <div className="settings-header-title">
                            <h1>App Settings</h1>
                            <p>
                                Control theme appearance, accent colors, hover effects, and general app behavior.
                                Changes apply instantly and are saved automatically.
                            </p>
                        </div>
                    </div>
                    <div className="settings-actions">
                        <button className="settings-btn reset" onClick={resetDefaults}>
                            Restore Defaults
                        </button>
                    </div>
                </div>

                <div className="settings-main">
                    {activeSection === "appearance" && (
                        <section className="settings-card">
                            <div className="settings-card-header">
                                <FaPalette />
                                <h2>Appearance</h2>
                            </div>
                            <p>Choose your preferred mode, accent, and hover styling for the whole app.</p>

                            <div className="settings-field">
                                <div className="settings-label">Theme Mode</div>
                                <div className="settings-mode-buttons">
                                    {[
                                        { label: "Dark", value: "dark", icon: <FaMoon /> },
                                        { label: "Light", value: "light", icon: <FaSun /> },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            className={`settings-mode-button ${settings.theme === item.value ? "active" : ""}`}
                                            onClick={() => updateSetting("theme", item.value)}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="settings-label">Accent Color</div>
                                <div className="settings-controls">
                                    <div className="settings-color-input">
                                        <span>{accentLabel}</span>
                                        <input
                                            type="color"
                                            value={settings.accent}
                                            onChange={(event) => updateSetting("accent", event.target.value)}
                                        />
                                    </div>
                                    {ACCENT_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={`settings-mode-button ${settings.accent === option.value ? "active" : ""}`}
                                            onClick={() => updateSetting("accent", option.value)}
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="settings-field">
                                <div className="settings-label">Hover Color</div>
                                <div className="settings-controls">
                                    <div className="settings-color-input">
                                        <span>Hover Accent</span>
                                        <input
                                            type="color"
                                            value={settings.hover}
                                            onChange={(event) => updateSetting("hover", event.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {activeSection === "updates" && (
                        <section className="settings-card">
                            <div className="settings-card-header">
                                <FaSyncAlt />
                                <h2>Updates</h2>
                            </div>
                            <p>Keep the app fresh with fast update checks and release notes.</p>

                            <div className="settings-update-panel">
                                <div className="settings-update-state">
                                    <div className="settings-update-title">{updateStatus}</div>
                                    <div className="settings-update-meta">Last checked: {lastChecked}</div>
                                </div>

                                <button
                                    type="button"
                                    className="settings-update-button"
                                    onClick={checkUpdates}
                                    disabled={checkingUpdates}
                                >
                                    {checkingUpdates ? "Checking..." : "Check for updates"}
                                </button>
                            </div>

                            <div className="settings-field">
                                <div className="settings-label">Auto-check for updates</div>
                                <button
                                    type="button"
                                    className={`settings-toggle ${settings.general.autoUpdate ? "active" : ""}`}
                                    onClick={() => updateGeneral("autoUpdate", !settings.general.autoUpdate)}
                                >
                                    <div className="settings-toggle-label">
                                        <span className="settings-toggle-title">Auto Update</span>
                                        <span className="settings-toggle-sub">Automatically check for new versions when the app starts.</span>
                                    </div>
                                    <div className={`settings-toggle-chip ${settings.general.autoUpdate ? "on" : "off"}`}>
                                        {settings.general.autoUpdate ? "On" : "Off"}
                                    </div>
                                </button>
                            </div>
                        </section>
                    )}

                    {activeSection === "general" && (
                        <section className="settings-card">
                            <div className="settings-card-header">
                                <FaSlidersH />
                                <h2>General</h2>
                            </div>
                            <p>Fine tune everyday app behavior, playback preferences, and interface comfort.</p>

                            <div className="settings-card-grid">
                                <div className="settings-box">
                                    <div className="settings-box-header">
                                        <h3>Playback</h3>
                                        <p>Keep your watch position and resume fast where you left off.</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`settings-toggle ${settings.general.autoResume ? "active" : ""}`}
                                        onClick={() => updateGeneral("autoResume", !settings.general.autoResume)}
                                    >
                                        <div className="settings-toggle-label">
                                            <span className="settings-toggle-title">Auto Resume</span>
                                            <span className="settings-toggle-sub">Resume playback automatically from last watched position.</span>
                                        </div>
                                        <div className={`settings-toggle-chip ${settings.general.autoResume ? "on" : "off"}`}>
                                            {settings.general.autoResume ? "On" : "Off"}
                                        </div>
                                    </button>
                                </div>

                                <div className="settings-box">
                                    <div className="settings-box-header">
                                        <h3>Interface</h3>
                                        <p>Reduce motion and keep the experience calm and smooth.</p>
                                    </div>
                                    <button
                                        type="button"
                                        className={`settings-toggle ${settings.general.safeMode ? "active" : ""}`}
                                        onClick={() => updateGeneral("safeMode", !settings.general.safeMode)}
                                    >
                                        <div className="settings-toggle-label">
                                            <span className="settings-toggle-title">Safe Mode</span>
                                            <span className="settings-toggle-sub">Reduce motion and simplify transitions for a calmer experience.</span>
                                        </div>
                                        <div className={`settings-toggle-chip ${settings.general.safeMode ? "on" : "off"}`}>
                                            {settings.general.safeMode ? "On" : "Off"}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </section>
    );
}
