import TitleBar from "./layout/TitleBar";
import Sidebar from "./layout/Sidebar";

import "./../assets/css/MainLayout.css";

export default function MainLayout({ children }) {
    return (
        <>
            <TitleBar />
            <Sidebar />

            <main className="main-content">
                {children}
            </main>
        </>
    );
}