import "./../../assets/css/sidebar.css";

import { NavLink } from "react-router-dom";

import {
    FaHome,
    FaFilm,
    FaBookmark,
    FaCog,
    FaInfoCircle
} from "react-icons/fa";

export default function Sidebar() {
    return (
        <aside className="sidebar">

            <div className="sidebar-center">

                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `sidebar-btn ${isActive ? "active" : ""}`
                    }
                >
                    <FaHome />
                </NavLink>

                

                <NavLink
                    to="/movies"
                    className={({ isActive }) =>
                        `sidebar-btn ${isActive ? "active" : ""}`
                    }
                >
                    <FaFilm />
                </NavLink>

                <NavLink
                    to="/watchlist"
                    className={({ isActive }) =>
                        `sidebar-btn ${isActive ? "active" : ""}`
                    }
                >
                    <FaBookmark />
                </NavLink>

            </div>

            <div className="sidebar-bottom">

                <NavLink
                    to="/about"
                    className={({ isActive }) =>
                        `sidebar-btn ${isActive ? "active" : ""}`
                    }
                >
                    <FaInfoCircle />
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `sidebar-btn ${isActive ? "active" : ""}`
                    }
                >
                    <FaCog />
                </NavLink>

            </div>

        </aside>
    );
}