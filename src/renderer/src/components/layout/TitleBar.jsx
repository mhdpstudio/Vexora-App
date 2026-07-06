import "./../../assets/css/title-bar.css";

import icon from "./../../../../../resources/icon.png";

import {
    FaWindowMinimize,
    FaWindowMaximize,
    FaTimes,
    FaGamepad
} from "react-icons/fa";

export default function TitleBar() {
    return (
        <header className="titlebar">

            <div className="titlebar-left">
                <img src={icon} className="logo" alt="Logo" />
                <span>Vexora</span>
            </div>

            <div className="titlebar-right">

                <button
                    className="tb-btn"
                    onClick={() => window.electron.minimize()}
                >
                    <FaWindowMinimize />
                </button>

                <button
                    className="tb-btn"
                    onClick={() => window.electron.maximize()}
                >
                    <FaWindowMaximize />
                </button>

                <button
                    className="tb-btn close"
                    onClick={() => window.electron.close()}
                >
                    <FaTimes />
                </button>

            </div>

        </header>
    );
}