// External Dependencies.
import React, { ReactElement } from 'react';

// Divi Dependencies.
import { ModuleContainer } from '@divi/module';

// Local Dependencies.
import { ContentOverviewEditProps } from './types';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';
import { ModuleScriptData } from './module-script-data';

// Newspaper / grid icon
const IconNewspaper = ({ size = 18 }: { size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
);

/**
 * ContentOverview edit component for the Divi Visual Builder.
 * Shows a static skeleton / mockup of the news hub layout.
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

                {/* Top grid skeleton */}
                <div className="vvp-co__top-grid">
                    {/* Hero skeleton */}
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

                    {/* Sidebar skeleton */}
                    <div className="vvp-co__sidebar">
                        <div className="vvp-co__sidebar-header">
                            <IconNewspaper size={14} />
                            <span className="vvp-co__sidebar-title">Neueste Artikel</span>
                        </div>
                        <div className="vvp-co__sidebar-cards">
                            {Array.from({ length: 5 }).map((_, i) => (
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

                {/* Feed section skeleton */}
                <div className="vvp-co__feed-section">
                    <div className="vvp-co__feed-header">
                        <span className="vvp-co__feed-heading">Weitere Beiträge</span>
                        <div className="vvp-co__feed-divider" />
                    </div>
                    <div className="vvp-co__feed-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
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
