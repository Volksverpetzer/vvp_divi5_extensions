// External Dependencies.
import React, { ReactElement } from 'react';

// Divi Dependencies.
import { ModuleContainer } from '@divi/module';

// Local Dependencies.
import { FactCheckSearchEditProps } from './types';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';
import { ModuleScriptData } from './module-script-data';
import { DEFAULT_API_URLS } from './constants';

// Search icon SVG (inline, no external dependency)
const IconSearch = ({ size = 18 }: { size?: number }) => (
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
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

// Shield check icon SVG
const IconShieldCheck = ({ size = 22 }: { size?: number }) => (
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

/**
 * FactCheckSearch edit component for Visual Builder.
 * Renders a static preview of the Faktencheck search bar.
 *
 * @since 1.0.0
 */
export const FactCheckSearchEdit = (props: FactCheckSearchEditProps): ReactElement => {
    const { attrs, elements, id, name } = props;

    const searchApiUrl = (attrs as any).searchApiUrl?.desktop?.value ?? DEFAULT_API_URLS.searchApiUrl;
    const importApiUrl = (attrs as any).importApiUrl?.desktop?.value ?? DEFAULT_API_URLS.importApiUrl;

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

            {/* Preview: blue search bar */}
            <div className="vvp-fc__wrapper">
                <section className="vvp-fc__bar">
                    <div className="vvp-fc__bar-inner">
                        {/* Label group */}
                        <div className="vvp-fc__bar-label-group">
                            <IconShieldCheck size={22} />
                            <div>
                                <p className="vvp-fc__bar-title">Faktencheck-Archiv durchsuchen</p>
                                <p className="vvp-fc__bar-desc">
                                    Text, Zitat oder URL eingeben. Wir zeigen passende Faktenchecks und bereits belegte Einordnungen.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="vvp-fc__bar-actions">
                            <div className="vvp-fc__bar-trigger vvp-fc__bar-trigger--preview">
                                <IconSearch size={15} />
                                <span>z.B. eine strittige Behauptung, ein Zitat oder eine URL...</span>
                            </div>
                            <button type="button" className="vvp-fc__bar-btn">
                                Im Archiv suchen
                            </button>
                        </div>
                    </div>
                </section>

                {/* API URL hints for editor only */}
                {(searchApiUrl === DEFAULT_API_URLS.searchApiUrl || importApiUrl === DEFAULT_API_URLS.importApiUrl) && (
                    <div className="vvp-fc__config-hint">
                        <p>
                            <strong>Standard-API-URLs werden verwendet:</strong> Such-API URL
                            {searchApiUrl === DEFAULT_API_URLS.searchApiUrl ? ' (Standard)' : ' ✓'} und Import-API URL
                            {importApiUrl === DEFAULT_API_URLS.importApiUrl ? ' (Standard)' : ' ✓'}. 
                            Sie können diese in den Moduleinstellungen anpassen.
                        </p>
                    </div>
                )}
            </div>
        </ModuleContainer>
    );
};
