import { useEffect, useState } from "react";
import { useBookmarks } from "./../renderer/src/context/BookmarkContext";
import { FaTrash, FaExternalLinkAlt, FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "./../renderer/src/assets/css/BookMarkPage.css";

export default function BookMarkPage() {

	const { bookmarks, removeBookmark } = useBookmarks();
	const navigate = useNavigate();

	if (!bookmarks || bookmarks.length === 0) {
		return (
			<section className="bookmark-empty">
				<FaRegBookmark className="bookmark-empty-icon" />
				<div className="bookmark-empty-title">No Bookmarks</div>
				<div className="bookmark-empty-sub">You haven't added any movies or cartoons yet</div>
			</section>
		);
	}

	return (
		<section className="video-page">
			<div className="bookmark-container">
				<h2 className="B-text">Bookmarks</h2>
				<div className="bookmark-grid">
					{bookmarks.map(b => (
						<article key={b.id} className="bookmark-card">
							<img className="bookmark-thumb" src={`https://raw.githubusercontent.com/mhdpstudio/Vexora/main/pics/${b.thumbnail}.webp`} alt={b.title} onClick={() => navigate(`/video/${b.id}`)} />
							<div className="bookmark-body">
								<div className="bookmark-meta">
									<div className="bookmark-title">{b.title}</div>
									<div className="bookmark-sub">{b.type} • {b.date}</div>
								</div>
								<div className="bookmark-actions">
									<button title="Go to" className="bookmark-action-btn" onClick={() => navigate(`/video/${b.id}`)}><FaExternalLinkAlt /></button>
									<button title="Remove" className="bookmark-action-btn" onClick={() => removeBookmark(b.id)}><FaTrash /></button>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
