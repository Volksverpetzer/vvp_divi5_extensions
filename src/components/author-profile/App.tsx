import * as React from 'react';
import { type Author, type Layout } from './types';

interface AuthorProfileAppProps {
    authors: Author[];
    showAvatar: boolean;
    showBio: boolean;
    showLink: boolean;
    layout: Layout;
    avatarSize: number;
}

const AuthorCard = ({
    author,
    showAvatar,
    showBio,
    showLink,
    avatarSize,
}: {
    author: Author;
    showAvatar: boolean;
    showBio: boolean;
    showLink: boolean;
    avatarSize: number;
}) => (
    <div className="vvp-ap__author">
        {showAvatar && author.avatarUrl && (
            <div className="vvp-ap__avatar-wrap">
                <img
                    src={author.avatarUrl}
                    alt={author.name}
                    className="vvp-ap__avatar"
                    width={avatarSize}
                    height={avatarSize}
                    style={{ width: avatarSize, height: avatarSize }}
                    loading="lazy"
                />
            </div>
        )}
        <div className="vvp-ap__info">
            <div className="vvp-ap__name">
                {showLink && author.profileUrl ? (
                    <a href={author.profileUrl} className="vvp-ap__name-link">
                        {author.name}
                    </a>
                ) : (
                    author.name
                )}
            </div>
            {showBio && author.bio && (
                <p className="vvp-ap__bio">{author.bio}</p>
            )}
        </div>
    </div>
);

export const AuthorProfileApp = ({
    authors,
    showAvatar,
    showBio,
    showLink,
    layout,
    avatarSize,
}: AuthorProfileAppProps) => {
    if (!authors.length) {
        return <div className="vvp-ap__empty">Kein Autor gefunden.</div>;
    }

    return (
        <div className={`vvp-ap__container vvp-ap__layout--${layout}`}>
            {authors.map((author, i) => (
                <AuthorCard
                    key={`${author.name}-${i}`}
                    author={author}
                    showAvatar={showAvatar}
                    showBio={showBio}
                    showLink={showLink}
                    avatarSize={avatarSize}
                />
            ))}
        </div>
    );
};
