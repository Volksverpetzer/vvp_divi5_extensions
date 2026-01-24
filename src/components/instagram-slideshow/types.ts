// External Dependencies.
import { type ModuleLibrary } from '@divi/types';

// Module attributes interface.
export interface InstagramSlideshowAttrs {
    module: object;
    postId: object;
    apiBaseUrl: object;
    showCaption: object;
    showNavigation: object;
    showPagination: object;
    autoplay: object;
    transitionSpeed: object;
}

// Edit component props.
export type InstagramSlideshowEditProps = ModuleLibrary.Module.RenderProps<InstagramSlideshowAttrs>;

// Instagram API response types.
export interface InstagramImage {
    media_url: string;
    id: string;
}

export interface InstagramData {
    media_type: string;
    children?: {
        data: InstagramImage[];
    };
    caption?: string;
    permalink?: string;
    timestamp?: number;
    media_url?: string;
    id?: string;
}
