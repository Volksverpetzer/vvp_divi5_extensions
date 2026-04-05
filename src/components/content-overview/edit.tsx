// External Dependencies.
import React, { ReactElement } from 'react';

// Divi Dependencies.
import { ModuleContainer } from '@divi/module';

// Local Dependencies.
import { ContentOverviewEditProps } from './types';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';
import { ModuleScriptData } from './module-script-data';

// ── Tiny icon set ────────────────────────────────────────────────────────────

const IconNewspaper = ({ size = 18 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
);

const IconYoutube = ({ size = 13 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 461 461" fill="currentColor" aria-hidden="true">
        <path d="M365 67H96C43 67 0 110 0 163v135c0 53 43 96 96 96h269c53 0 96-43 96-96V163c0-53-43-96-96-96zm-65 170l-126 60c-3 2-7-1-7-5V169c0-4 4-6 7-5l126 64c4 2 4 7 0 9z"/>
    </svg>
);

const IconPodcast = ({ size = 12 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
);

const IconInsta = ({ size = 13 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
);

// ── Example card components ───────────────────────────────────────────────────

const ExArticleCard = ({ title, excerpt, badge }: { title: string; excerpt: string; badge: string }) => (
    <div className="vvp-co__feed-card" style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
        <div style={{ background: '#e5e7eb', aspectRatio: '16/9' }} />
        <div className="vvp-co__feed-body" style={{ padding: '12px 14px 14px' }}>
            <div className="vvp-co__feed-meta" style={{ marginBottom: 6 }}>
                <span className="vvp-co__badge" style={{ background: '#f3f4f6', color: '#374151', fontSize: 11, padding: '2px 7px', borderRadius: 4 }}>
                    <IconNewspaper size={11} /> {badge}
                </span>
            </div>
            <div className="vvp-co__feed-title" style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.35, marginBottom: 6, color: '#111' }}>{title}</div>
            <p className="vvp-co__feed-excerpt" style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{excerpt}</p>
        </div>
    </div>
);

const ExIgCard = () => (
    <div className="vvp-co__feed-card vvp-co__feed-card--insta" style={{ background: '#000', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: '#1a1a2e', aspectRatio: '4/3', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#555', fontSize: 12 }}>Vorschau-Bild</span>
            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#fff' : 'rgba(255,255,255,.4)' }} />)}
            </div>
        </div>
        <div className="vvp-co__feed-body" style={{ padding: '10px 14px 12px', background: '#111' }}>
            <span className="vvp-co__badge vvp-co__badge--insta" style={{ fontSize: 11 }}><IconInsta /> Instagram (3 Bilder)</span>
            <p className="vvp-co__feed-excerpt" style={{ color: '#d1d5db', fontSize: 13, marginTop: 6 }}>
                Beispiel-Caption für einen Instagram-Beitrag …
            </p>
        </div>
    </div>
);

const ExYtCard = () => (
    <div className="vvp-co__feed-card vvp-co__feed-card--youtube" style={{ borderRadius: 8, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
        <div style={{ background: '#1a1a2e', aspectRatio: '16/9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(255,0,0,.85)', borderRadius: 8, padding: '8px 14px' }}>
                <svg width="22" height="16" viewBox="0 0 461 461" fill="#fff"><path d="M365 67H96C43 67 0 110 0 163v135c0 53 43 96 96 96h269c53 0 96-43 96-96V163c0-53-43-96-96-96zm-65 170l-126 60c-3 2-7-1-7-5V169c0-4 4-6 7-5l126 64c4 2 4 7 0 9z"/></svg>
            </div>
        </div>
        <div className="vvp-co__feed-body" style={{ padding: '10px 14px 12px' }}>
            <span className="vvp-co__badge vvp-co__badge--youtube" style={{ fontSize: 11 }}><IconYoutube /> YouTube</span>
            <div className="vvp-co__feed-title" style={{ fontWeight: 700, fontSize: 14, marginTop: 6, color: '#111' }}>Beispiel-Video: Faktencheck aktuell</div>
        </div>
    </div>
);

const ExPodcastCard = () => (
    <div className="vvp-co__podcast-banner" style={{ background: 'linear-gradient(135deg,#1e3a5f,#0f1f3a)', borderRadius: 8, padding: 16, color: '#fff', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: 8, background: '#2d4a6e', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconPodcast size={28} />
        </div>
        <div>
            <span className="vvp-co__badge vvp-co__badge--podcast" style={{ fontSize: 11, marginBottom: 6, display: 'inline-flex' }}><IconPodcast /> Podcast</span>
            <div className="vvp-co__podcast-title" style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Volksverpetzer Podcast – Folge 42</div>
            <p className="vvp-co__podcast-summary" style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 8px' }}>In dieser Folge sprechen wir über Desinformation und Medienkompetenz …</p>
            <button type="button" className="vvp-co__podcast-listen-btn" style={{ cursor: 'default' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Anhören
            </button>
        </div>
    </div>
);

// ── Main edit component ───────────────────────────────────────────────────────

/**
 * ContentOverview edit component for the Divi Visual Builder.
 * Shows representative example cards so the editor can see the real layout.
 *
 * @since 1.0.0
 */
export const ContentOverviewEdit = (props: ContentOverviewEditProps): ReactElement => {
    const { attrs, elements, id, name } = props;

    return (
        <ModuleContainer
            attrs={attrs}
            elements={elements}
            id={id}
            name={name}
            stylesComponent={ModuleStyles}
            classnamesFunction={moduleClassnames}
            scriptDataComponent={ModuleScriptData}
        >
            {elements.styleComponents({ attrName: 'module' })}

            <div className="vvp-co__wrapper vvp-co__wrapper--preview">
                {/* Module header hint */}
                <div className="vvp-co__preview-header">
                    <IconNewspaper size={16} />
                    <span className="vvp-co__preview-label">Inhaltsübersicht — Live-Daten werden serverseitig geladen</span>
                </div>

                {/* Top grid skeleton (hero + sidebar) */}
                <div className="vvp-co__top-grid">
                    <div className="vvp-co__hero-wrap">
                        <div className="vvp-co__skeleton vvp-co__skeleton--hero">
                            <div className="vvp-co__skeleton-img" />
                            <div className="vvp-co__skeleton-body">
                                <div className="vvp-co__skeleton-badge" />
                                <div className="vvp-co__skeleton-line vvp-co__skeleton-line--title" />
                                <div className="vvp-co__skeleton-line" />
                                <div className="vvp-co__skeleton-line vvp-co__skeleton-line--short" />
                            </div>
                        </div>
                    </div>

                    <div className="vvp-co__sidebar">
                        <div className="vvp-co__sidebar-header">
                            <IconNewspaper size={14} />
                            <span className="vvp-co__sidebar-title">Neueste Artikel</span>
                        </div>
                        <div className="vvp-co__sidebar-cards">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="vvp-co__skeleton vvp-co__skeleton--compact">
                                    <div className="vvp-co__skeleton-thumb" />
                                    <div className="vvp-co__skeleton-body">
                                        <div className="vvp-co__skeleton-line" />
                                        <div className="vvp-co__skeleton-line vvp-co__skeleton-line--short" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Feed section — representative real-looking example cards */}
                <div className="vvp-co__feed-section">
                    <div className="vvp-co__feed-header">
                        <span className="vvp-co__feed-heading">Weitere Beiträge</span>
                        <div className="vvp-co__feed-divider" />
                    </div>
                    <div className="vvp-co__feed-grid">
                        {/* Row 1: three article cards */}
                        <div className="vvp-co__feed-item">
                            <ExArticleCard badge="Volksverpetzer" title="Warum Fakten mehr zählen als Gefühle" excerpt="Eine Analyse der häufigsten Desinformationsmuster in sozialen Netzwerken." />
                        </div>
                        <div className="vvp-co__feed-item">
                            <ExIgCard />
                        </div>
                        <div className="vvp-co__feed-item">
                            <ExArticleCard badge="Prüfpunkt" title="Klimaschutz: Was stimmt wirklich?" excerpt="Der Faktencheck zur aktuellen politischen Debatte über Emissionsziele." />
                        </div>

                        {/* Row 2: YouTube + podcast (full width) + article */}
                        <div className="vvp-co__feed-item">
                            <ExYtCard />
                        </div>
                        <div className="vvp-co__feed-item vvp-co__feed-item--podcast" style={{ gridColumn: 'span 2' }}>
                            <ExPodcastCard />
                        </div>

                        {/* Row 3: more article skeletons */}
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="vvp-co__feed-item">
                                <div className="vvp-co__skeleton vvp-co__skeleton--feed">
                                    <div className="vvp-co__skeleton-img" />
                                    <div className="vvp-co__skeleton-body">
                                        <div className="vvp-co__skeleton-badge" />
                                        <div className="vvp-co__skeleton-line vvp-co__skeleton-line--title" />
                                        <div className="vvp-co__skeleton-line" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ModuleContainer>
    );
};
