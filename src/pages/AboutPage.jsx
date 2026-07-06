import { FaInfoCircle, FaRocket, FaShieldAlt, FaHeart } from "react-icons/fa";
import "./../renderer/src/assets/css/AboutPage.css";

function AboutPage() {
    return (
        <section className="about-page about-centered">
            <div className="about-card about-card-centered">
                <div className="about-top">
                    <FaInfoCircle />
                    <div>
                        <h1>Videos App</h1>
                        <p className="about-tagline">
                            A sleek Electron video player built for series and movie lovers.
                            Resume watching, bookmark favorites, and enjoy a smooth local experience.
                        </p>
                    </div>
                </div>

                <div className="about-team">
                    <div>
                        <h2>Mahmoud Ahmed</h2>
                        <p>Creator & Developer</p>
                    </div>
                    <span className="about-team-divider">&</span>
                    <div>
                        <h2>Zayad Magdy</h2>
                        <p>Publishing Partner</p>
                    </div>
                </div>

                <div className="about-grid">
                    <div className="about-item">
                        <FaRocket />
                        <h3>Premium UX</h3>
                        <p>
                            Clean interface with fast playback controls and responsive video navigation.
                        </p>
                    </div>
                    <div className="about-item">
                        <FaShieldAlt />
                        <h3>Built for Local Use</h3>
                        <p>
                            Works smoothly with local video files and keeps your history in place.
                        </p>
                    </div>
                    <div className="about-item">
                        <FaHeart />
                        <h3>Made with Care</h3>
                        <p>
                            Designed personally by Mahmoud and published with Zayad to keep it polished.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AboutPage;
