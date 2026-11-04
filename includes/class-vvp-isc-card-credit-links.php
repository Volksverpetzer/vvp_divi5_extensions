<?php
/**
 * Keeps Image Source Control's credit links out of the article cards' links.
 *
 * Article cards (CardRenderTrait::render_featured_card()) are one
 * `<a class="vvp-co__feed-card">` around the image, title and meta data.
 * Image Source Control (ISC) wraps every <img> in post content with its
 * credit, and when the image has a source URL (or a licence URL) the credit
 * is a link: `<span class="isc-source-text"><a href="…">© …</a></span>`.
 * Inside the card that is a nested anchor, which HTML doesn't allow: the
 * browser's parser closes the card link at the credit, so the title, excerpt
 * and footer fall out of the link (and React's hydration no longer matches).
 *
 * ISC has no per-image setting for this, and its filters
 * (`isc_public_source_url_html`, `isc_overlay_html_source`) only get the image
 * ID, not where the image sits. So this unwraps any link inside a card's image
 * wrapper after ISC has run — ISC adds its credits on `the_content` at
 * priority 20, and the cards are rendered inside that content (front page,
 * Artikelkarte). The credit text stays; only the link around it goes.
 *
 * frontend.tsx unwraps them again before hydrating, for markup that reaches
 * the browser some other way (e.g. ISC's "all images" option, which rewrites
 * the whole page).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class VVP_Isc_Card_Credit_Links {

	// After ISC's add_sources_to_content (priority 20).
	const PRIORITY = 30;

	public static function init() {
		add_filter( 'the_content', array( __CLASS__, 'unwrap_links' ), self::PRIORITY );
	}

	/**
	 * Removes the <a> tags (keeping their content) inside each
	 * `.vvp-co__feed-image-wrap`. The wrapper holds only the <img> and ISC's
	 * spans, never a nested <div>, so its closing tag is the first `</div>`.
	 *
	 * @param string $content Post content.
	 * @return string
	 */
	public static function unwrap_links( $content ) {
		if ( ! is_string( $content ) || false === strpos( $content, 'vvp-co__feed-image-wrap' ) ) {
			return $content;
		}

		$result = preg_replace_callback(
			'#(<div class="vvp-co__feed-image-wrap">)(.*?)(</div>)#s',
			static function ( $m ) {
				return $m[1] . preg_replace( '#</?a\b[^>]*>#i', '', $m[2] ) . $m[3];
			},
			$content
		);

		// preg_replace_callback() returns null on a PCRE error; never lose the content.
		return null === $result ? $content : $result;
	}
}
