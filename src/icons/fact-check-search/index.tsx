import React, { type ReactElement } from 'react';

// Icon data for Divi icon library — magnifying glass with checkmark.
export const name = 'vvp/fact-check-search-icon';
export const viewBox = '0 0 24 24';
export const component = (): ReactElement => (
    <>
        {/* Magnifying glass */}
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Small checkmark inside circle */}
        <path d="M8.5 11l2 2 3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </>
);
