import HeroBanner from "../renderer/src/components/HeroBanner";
import SectionsHome from "../renderer/src/components/SectionsHome";

function Home() {
    return (
        <main className="home">
            <HeroBanner />
            <SectionsHome />
        </main>
    );
}

export default Home;