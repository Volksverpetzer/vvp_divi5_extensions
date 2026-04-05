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
import { FactCheckSearchApp } from './App';

// Search icon SVG (inline, no external dependency)
// Shield check icon SVG

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

            {/* Preview: full React App */}
            <div className="vvp-fc__mount-preview" style={{ position: 'relative' }}>
                <FactCheckSearchApp searchApiUrl={searchApiUrl} importApiUrl={importApiUrl} />
                
                {/* API URL hints for editor only */}
                {(searchApiUrl === DEFAULT_API_URLS.searchApiUrl || importApiUrl === DEFAULT_API_URLS.importApiUrl) && (
                    <div className="vvp-fc__config-hint" style={{ marginTop: '1rem' }}>
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
