import { createContext, useContext, useEffect, useState } from "react";

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {

    const [bookmarks, setBookmarks] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const api = window?.api?.bookmarks;
                if (api && api.read) {
                    const list = await api.read();
                    if (mounted && Array.isArray(list)) setBookmarks(list);
                    return;
                }
            } catch (e) {
                // ignore
            }

            try {
                const list = JSON.parse(localStorage.getItem("bookmarks")) || [];
                if (mounted) setBookmarks(list);
            } catch (e) {
                if (mounted) setBookmarks([]);
            }
        })();

        return () => { mounted = false };
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const api = window?.api?.bookmarks;
                if (api && api.write) {
                    await api.write(bookmarks);
                    return;
                }
            } catch (e) {
                // ignore
            }

            try {
                localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
            } catch (e) { }
        })();
    }, [bookmarks]);

    const addBookmark = (video) => {
        const exists = bookmarks.find(b => b.id === video.id);
        if (exists) return;
        setBookmarks(prev => [video, ...prev]);
    };

    const removeBookmark = (id) => {
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const isBookmarked = (id) => bookmarks.some(b => b.id === id);

    return (
        <BookmarkContext.Provider
            value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}
        >
            {children}
        </BookmarkContext.Provider>
    );
}

export const useBookmarks = () => useContext(BookmarkContext);
