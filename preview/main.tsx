import React from 'react';
import { createRoot } from 'react-dom/client';
import '../src/components/fact-check-search/style.scss';
import '../src/components/content-overview/style.scss';
import '../src/components/author-profile/style.scss';
import { FactCheckSearchApp } from '../src/components/fact-check-search/App';
import { InstagramSlideshow } from '../src/components/content-overview/InstagramSlideshow';
import { PodcastBanner } from '../src/components/content-overview/PodcastBanner';
import { AuthorProfileApp } from '../src/components/author-profile/App';

// ── Sample data ───────────────────────────────────────────────────────────────

const AUTHOR_SINGLE = [
    {
        name: 'Max Mustermann',
        bio: 'Journalist und Faktenchecker bei Volksverpetzer.<br />\nSchreibt über Desinformation, Medien und Demokratie.<br />\n<br />\nSeit 2018 bei Volksverpetzer.',
        avatarUrl: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=150',
        profileUrl: '#',
    },
];

const AUTHOR_MULTI = [
    {
        name: 'Max Mustermann',
        bio: 'Journalist und Faktenchecker. Spezialisiert auf politische Desinformation.',
        avatarUrl: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=150',
        profileUrl: '#',
    },
    {
        name: 'Erika Musterfrau',
        bio: 'Redakteurin und Faktencheckerin. Fokus auf Social-Media-Manipulation.',
        avatarUrl: 'https://www.gravatar.com/avatar/11111111111111111111111111111111?d=mp&s=150',
        profileUrl: '#',
    },
];

const IG_PROPS = {
    permalink: 'https://www.instagram.com/volksverpetzer/',
    caption: 'Das ist ein Beispiel-Caption für einen Instagram-Beitrag. Hier könnte eine längere Beschreibung oder ein Faktencheck-Hinweis stehen.',
    date: '7. April 2026',
    badgeLabel: 'Instagram · 3 Bilder',
    slides: [
        { thumb: 'https://picsum.photos/seed/ig1/400/533', video: '' },
        { thumb: 'https://picsum.photos/seed/ig2/400/533', video: '' },
        { thumb: 'https://picsum.photos/seed/ig3/400/533', video: '' },
    ],
    isCarousel: true,
};

const PODCAST_PROPS = {
    title: 'Volksverpetzer Podcast – Folge 42: Desinformation in der Praxis',
    link: 'https://volksverpetzer.de/podcast/',
    enclosure: 'https://cdn.podigee.com/media/podcast_episode_example.mp3',
    date: '7. April 2026',
    duration: '42:00',
    summary: 'In dieser Folge sprechen wir über die häufigsten Desinformationsmuster und wie wir sie erkennen können.',
    artworkUrl: 'https://picsum.photos/seed/podcast/120/120',
};

// ── Preview shell ─────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: '3rem', paddingTop: '3rem', borderTop: '2px dashed #e5e7eb' }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '1.5rem' }}>
            {title}
        </h2>
        {children}
    </section>
);

const App = () => (
    <div>
        <div style={{ background: '#111827', color: '#9ca3af', fontSize: 11, padding: '6px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <strong style={{ color: '#fff' }}>Divi5Extensions</strong>
            <span>Component Preview</span>
            <span>·</span>
            <span>Vite dev server · port 8899</span>
        </div>

        <div style={{ width: '100%', padding: '2rem 0' }}>

            <Section title="FactCheckSearch Module">
                <FactCheckSearchApp
                    searchApiUrl="https://ai.volksverpetzer-app.de/api/vector-search/"
                    importApiUrl="https://ai.volksverpetzer-app.de/api/import-url/"
                />
            </Section>

            <Section title="AuthorProfile · Vertikal (1 Autor)">
                <div className="vvp-author-profile" style={{ maxWidth: 640, padding: '1.5rem', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                    <AuthorProfileApp authors={AUTHOR_SINGLE} showAvatar showBio showLink layout="vertical" avatarSize={80} />
                </div>
            </Section>

            <Section title="AuthorProfile · Horizontal (2 Autoren / Co-Autoren) · avatarSize=120">
                <div className="vvp-author-profile" style={{ maxWidth: 760, padding: '1.5rem', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                    <AuthorProfileApp authors={AUTHOR_MULTI} showAvatar showBio showLink layout="horizontal" avatarSize={120} />
                </div>
            </Section>

            <Section title="AuthorProfile · Kein Avatar, kein Link">
                <div className="vvp-author-profile" style={{ maxWidth: 640, padding: '1.5rem', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                    <AuthorProfileApp authors={AUTHOR_SINGLE} showAvatar={false} showBio showLink={false} layout="vertical" avatarSize={80} />
                </div>
            </Section>

            <Section title="ContentOverview · InstagramSlideshow">
                <div style={{ maxWidth: 360 }}>
                    <InstagramSlideshow {...IG_PROPS} />
                </div>
            </Section>

            <Section title="ContentOverview · PodcastBanner">
                <PodcastBanner {...PODCAST_PROPS} />
            </Section>

        </div>
    </div>
);

createRoot(document.getElementById('root')!).render(<App />);
