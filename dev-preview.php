<?php
/**
 * Standalone preview for the ContentOverview module — no WordPress/Divi needed.
 *
 * Usage:
 *   php -S localhost:8787 preview.php      # live dev server
 *   php preview.php > /tmp/preview.html    # static file
 *   php preview.php --flush               # clear transient cache first
 */

declare(strict_types=0);

// ── Global namespace: WP stubs + rendering ───────────────────────────────────
namespace {

    if (PHP_SAPI === 'cli-server' && preg_match('/\.(?:png|jpg|jpeg|gif|css|js|map)$/', parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH) ?? '')) {
        return false; // serve the requested resource as-is.
    }

    define('ABSPATH', __DIR__ . '/');
    define('HOUR_IN_SECONDS', 3600);

    // ── Flush cache ───────────────────────────────────────────────────────────
    $is_flush = in_array('--flush', $argv ?? [], true)
             || (isset($_GET['flush']) && PHP_SAPI !== 'cli');

    if ($is_flush) {
        foreach (glob(sys_get_temp_dir() . '/vvp_co_preview_*.cache') ?: [] as $f) {
            unlink($f);
        }
        if (PHP_SAPI !== 'cli') {
            header('Location: ' . strtok($_SERVER['REQUEST_URI'] ?? '/', '?'));
            exit;
        }
        echo "[cache flushed]\n";
    }

    // ── WordPress HTTP stubs ──────────────────────────────────────────────────

    class WP_Error
    {
        public function __construct(public readonly string $msg = '') {}
        public function get_error_message(): string { return $this->msg; }
    }

    function is_wp_error(mixed $thing): bool { return $thing instanceof WP_Error; }

    function _vvp_curl_request(string $url, array $args, bool $head_only): array|WP_Error
    {
        if (!extension_loaded('curl')) {
            return new WP_Error('curl extension not available');
        }
        $follow = ((int)($args['redirection'] ?? 5)) > 0;

        $http_headers = ['Accept: application/json, text/xml, */*'];
        foreach (($args['headers'] ?? []) as $k => $v) {
            $http_headers[] = "{$k}: {$v}";
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => (int)($args['timeout'] ?? 15),
            CURLOPT_USERAGENT      => $args['user-agent'] ?? 'VVP-Preview/1.0',
            CURLOPT_FOLLOWLOCATION => $follow,
            CURLOPT_ENCODING       => '',
            CURLOPT_HTTPHEADER     => $http_headers,
            CURLOPT_NOBODY         => $head_only,
        ]);
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        @curl_close($ch);

        if ($err || $body === false) {
            return new WP_Error($err ?: "cURL failed for {$url}");
        }
        return ['body' => $head_only ? '' : $body, 'response' => ['code' => $code]];
    }

    function wp_remote_get(string $url, array $args = []): array|WP_Error
    {
        return _vvp_curl_request($url, $args, false);
    }

    function wp_remote_head(string $url, array $args = []): array|WP_Error
    {
        return _vvp_curl_request($url, $args, true);
    }

    function wp_remote_retrieve_response_code(array $r): int { return (int)($r['response']['code'] ?? 0); }
    function wp_remote_retrieve_body(array $r): string       { return $r['body'] ?? ''; }

    // ── Transient cache (file-based in /tmp) ──────────────────────────────────

    function get_transient(string $key): mixed
    {
        $path = sys_get_temp_dir() . '/vvp_co_preview_' . md5($key) . '.cache';
        if (!file_exists($path)) return false;
        $meta = @unserialize(file_get_contents($path));
        if (!$meta || time() > $meta['expires']) { @unlink($path); return false; }
        return $meta['data'];
    }

    function set_transient(string $key, mixed $value, int $ttl = 3600): bool
    {
        $path = sys_get_temp_dir() . '/vvp_co_preview_' . md5($key) . '.cache';
        return (bool)file_put_contents($path, serialize(['data' => $value, 'expires' => time() + $ttl]));
    }

    // ── WordPress escaping stubs ──────────────────────────────────────────────

    function wp_strip_all_tags(string $text, bool $remove_breaks = false): string
    {
        $text = preg_replace('@<(script|style)[^>]*?>.*?</\\1>@si', '', $text);
        $text = strip_tags($text);
        if ($remove_breaks) { $text = preg_replace('/[\r\n\t ]+/', ' ', $text); }
        return trim($text);
    }

    function esc_html(string $text): string { return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
    function esc_attr(string $text): string { return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }

    function esc_url(string $url): string
    {
        $url = trim($url);
        if (!preg_match('/^https?:\/\//i', $url)) return '';
        return htmlspecialchars($url, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    function wp_json_encode(mixed $data): string|false { return json_encode($data); }

    function get_avatar_url(mixed $id_or_email, array $args = []): string
    {
        $size = (int)($args['size'] ?? 96);
        return "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s={$size}";
    }

    function get_author_posts_url(int $author_id): string { return '#'; }
    function get_post_field(string $field, int $post_id): mixed { return 1; }
    function get_the_ID(): int { return 1; }

    function get_the_author_meta(string $meta, int $author_id): string
    {
        return match ($meta) {
            'display_name' => 'Max Mustermann',
            'description'  => 'Journalist und Faktenchecker bei Volksverpetzer. Schreibt über Desinformation, Medien und Demokratie.',
            default        => '',
        };
    }

    // ── WordPress Popular Posts stubs ─────────────────────────────────────────

    function wpp_get_ids(array $args = []): array
    {
        $mock_ids = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
        return array_slice($mock_ids, 0, (int)($args['limit'] ?? 10));
    }

    function get_post(int $post_id): ?object
    {
        static $posts = [
            101 => ['title' => 'Faktencheck: Behauptung über Migranten widerlegt',         'slug' => '/faktencheck/behauptung-migranten/'],
            102 => ['title' => '5 Mythen über Impfstoffe — und was wirklich stimmt',        'slug' => '/faktencheck/mythen-impfstoffe/'],
            103 => ['title' => 'Warum dieser Viral-Post kompletter Unsinn ist',              'slug' => '/desinformation/viral-post-unsinn/'],
            104 => ['title' => 'Klimaschutz: Was die Zahlen wirklich sagen',                'slug' => '/faktencheck/klimaschutz-zahlen/'],
            105 => ['title' => 'Desinformation im Wahlkampf: Das steckt dahinter',          'slug' => '/desinformation/wahlkampf/'],
            106 => ['title' => 'Interview: So erkennt man Fake News auf den ersten Blick',  'slug' => '/interview/fake-news-erkennen/'],
            107 => ['title' => 'Podcast: Medienmanipulation im Netz erklärt',               'slug' => '/podcast/medienmanipulation/'],
            108 => ['title' => 'Die größten Falschmeldungen des Monats',                    'slug' => '/desinformation/falschmeldungen-monat/'],
            109 => ['title' => 'YouTube-Faktencheck: Werden wir wirklich belogen?',         'slug' => '/youtube/faktencheck-belogen/'],
            110 => ['title' => 'Hintergrund: Algorithmische Desinformation',                'slug' => '/hintergrund/algorithmische-desinformation/'],
        ];
        if (!isset($posts[$post_id])) return null;
        return (object)[
            'ID'          => $post_id,
            'post_status' => 'publish',
            'post_title'  => $posts[$post_id]['title'],
            'post_type'   => 'post',
            '_slug'       => $posts[$post_id]['slug'],
        ];
    }

    function get_the_title(int $post_id): string
    {
        $post = get_post($post_id);
        return $post ? $post->post_title : '';
    }

    function get_permalink(int $post_id): string
    {
        $post = get_post($post_id);
        return $post ? 'https://volksverpetzer.de' . $post->_slug : '#';
    }

    function get_the_post_thumbnail_url(int $post_id, string $size = 'thumbnail'): string|false
    {
        return in_array($post_id, [101, 102, 103, 104, 105], true)
            ? "https://picsum.photos/seed/{$post_id}/320/240"
            : false;
    }

    function get_post_type(int $post_id): string { return 'post'; }

    function get_the_date(string $format, int $post_id): string
    {
        static $dates = [
            101 => '2026-04-20', 102 => '2026-04-18', 103 => '2026-04-15',
            104 => '2026-04-12', 105 => '2026-04-10', 106 => '2026-04-08',
            107 => '2026-04-06', 108 => '2026-04-04', 109 => '2026-04-02',
            110 => '2026-03-30',
        ];
        $raw = $dates[$post_id] ?? '2026-01-01';
        try {
            return (new \DateTime($raw))->format($format);
        } catch (\Exception $e) {
            return $raw;
        }
    }

    function get_the_category(int $post_id): array
    {
        static $cats = [
            101 => ['Faktencheck', 'faktencheck'],
            102 => ['Faktencheck', 'faktencheck'],
            103 => ['Desinformation', 'desinformation'],
            104 => ['Faktencheck', 'faktencheck'],
            105 => ['Desinformation', 'desinformation'],
            106 => ['Interview', 'interview'],
            107 => ['Podcast', 'podcast'],
            108 => ['Desinformation', 'desinformation'],
            109 => ['YouTube', 'youtube'],
            110 => ['Hintergrund', 'hintergrund'],
        ];
        if (!isset($cats[$post_id])) return [];
        return [(object)['term_id' => $post_id, 'name' => $cats[$post_id][0], 'slug' => $cats[$post_id][1]]];
    }

    function get_category_link(int $term_id): string
    {
        $post = get_post($term_id);
        $slug = $post->_slug ?? '';
        $parts = explode('/', trim($slug, '/'));
        return 'https://volksverpetzer.de/category/' . ($parts[0] ?? '');
    }

    function get_the_excerpt(int $post_id): string
    {
        static $excerpts = [
            101 => 'Eine weit verbreitete Behauptung über Migranten wurde von Faktencheckern widerlegt.',
            102 => 'Fünf hartnäckige Mythen über Impfstoffe – und was die Wissenschaft wirklich sagt.',
            103 => 'Dieser Viral-Post kursiert millionenfach, dabei ist er komplett erfunden.',
            104 => 'Was steckt wirklich hinter den Klimaschutz-Zahlen? Eine Einordnung.',
            105 => 'Wie Desinformation im Wahlkampf gezielt eingesetzt wird.',
            106 => 'Experten erklären, woran man Fake News auf den ersten Blick erkennt.',
            107 => 'Im Podcast: Wie Medienmanipulation im Netz funktioniert.',
            108 => 'Die größten Falschmeldungen des Monats im Überblick.',
            109 => 'YouTube-Faktencheck: Werden wir wirklich systematisch belogen?',
            110 => 'Hintergrund: Wie algorithmische Desinformation verbreitet wird.',
        ];
        return $excerpts[$post_id] ?? '';
    }

} // end namespace {}

// ── AuthorProfile namespace: stub + preview wrapper ──────────────────────────
namespace VVP\Divi5\AuthorProfile {

    class AuthorProfile {}

    require __DIR__ . '/modules/AuthorProfile/AuthorProfileTrait/RenderCallbackTrait.php';

    class AuthorProfilePreview
    {
        use AuthorProfileTrait\RenderCallbackTrait;

        public static function render_with_mock(): string
        {
            $authors = [
                [
                    'name'       => 'Max Mustermann',
                    'bio'        => 'Journalist und Faktenchecker bei Volksverpetzer. Schreibt über Desinformation, Medien und Demokratie.',
                    'avatarUrl'  => get_avatar_url(1, ['size' => 150]),
                    'profileUrl' => get_author_posts_url(1),
                ],
            ];

            $attrs = esc_attr(wp_json_encode($authors));

            return sprintf(
                '<div class="vvp-author-profile">'
                . '<div class="vvp-ap__mount"'
                . ' data-authors="%s"'
                . ' data-show-avatar="true"'
                . ' data-show-bio="true"'
                . ' data-show-link="true"'
                . ' data-layout="vertical"'
                . ' data-avatar-size="200">'
                . '</div></div>',
                $attrs
            );
        }
    }

} // end namespace VVP\Divi5\AuthorProfile

// ── ContentOverview namespace: stub + preview wrapper ────────────────────────
namespace VVP\Divi5\ContentOverview {

    // Stub the self-reference used in render_callback() (not called in preview)
    class ContentOverview {}

    // Load the real trait (defines VVP\Divi5\ContentOverview\ContentOverviewTrait\RenderCallbackTrait)
    require __DIR__ . '/modules/ContentOverview/ContentOverviewTrait/RenderCallbackTrait.php';

    /**
     * Thin wrapper that exposes the private build_overview_html() for the preview.
     */
    class ContentOverviewPreview
    {
        use ContentOverviewTrait\RenderCallbackTrait;

        public static function render(): string
        {
            return self::build_overview_html();
        }
    }

} // end namespace VVP\Divi5\ContentOverview

// ── TrendingItems namespace: stub + preview wrapper ──────────────────────────
namespace VVP\Divi5\TrendingItems {

    class TrendingItems {}

    require __DIR__ . '/modules/TrendingItems/TrendingItemsTrait/RenderCallbackTrait.php';

    class TrendingItemsPreview
    {
        use TrendingItemsTrait\RenderCallbackTrait;

        public static function render(string $range = 'last7days'): string
        {
            $items = self::get_trending_items(3, $range);

            if (empty($items)) {
                return '<div class="vvp-ti__empty">Keine Trending-Beiträge gefunden.</div>';
            }

            return '<div class="vvp-ti__mount" data-articles="' . esc_attr(wp_json_encode($items)) . '"></div>';
        }
    }

} // end namespace VVP\Divi5\TrendingItems

// ── Back to global: render + output ──────────────────────────────────────────
namespace {

    $t0            = microtime(true);
    $overview      = \VVP\Divi5\ContentOverview\ContentOverviewPreview::render();
    $author_html   = \VVP\Divi5\AuthorProfile\AuthorProfilePreview::render_with_mock();
    $trending_top  = \VVP\Divi5\TrendingItems\TrendingItemsPreview::render();

    $section_label = '<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:1.5rem;">';

    $body  = $section_label . 'Fact Check Search Module</h2>';
    $body .= '<div class="vvp-fc__mount" data-search-url="" data-import-url="" style="margin-bottom: 2rem;"></div>';

    $body .= '<div style="margin: 3rem 0; padding-top: 3rem; border-top: 2px dashed #e5e7eb;">';
    $body .= $section_label . 'Author Profile Module</h2>';
    $body .= '<div style="max-width:640px;padding:1.5rem;background:#fff;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,.08)">';
    $body .= $author_html;
    $body .= '</div></div>';

    $body .= '<div style="margin: 3rem 0; padding-top: 3rem; border-top: 2px dashed #e5e7eb;">';
    $body .= $section_label . 'Trending Items Module</h2>';
    $body .= '<p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin:0 0 .75rem;">Meistgelesene Artikel (letzte 7 Tage)</p>';
    $body .= '<div class="vvp-trending-items">' . $trending_top . '</div>';
    $body .= '</div>';

    $body .= '<div style="margin: 3rem 0; padding-top: 3rem; border-top: 2px dashed #e5e7eb;">';
    $body .= $overview;
    $body .= '</div>';

    $took     = round((microtime(true) - $t0) * 1000);
    $tmp_dir = sys_get_temp_dir();

    $css = file_exists(__DIR__ . '/styles/main.css')
        ? file_get_contents(__DIR__ . '/styles/main.css')
        : '';


    if (PHP_SAPI === 'cli') {
        // CLI: write static file
        $out = sys_get_temp_dir() . '/vvp_co_preview.html';
        file_put_contents($out, build_html_page($body, $css, $took, $tmp_dir));
        echo "Preview written to: {$out}\n";
        echo "Open with: open \"{$out}\"\n";
        exit;
    }

    header('Content-Type: text/html; charset=UTF-8');
    echo build_html_page($body, $css, $took, $tmp_dir);

    function build_html_page(string $body, string $css, int $took, string $tmp_dir): string
    {
        return <<<HTML
        <!DOCTYPE html>
        <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>VVP Divi Extensions — Preview</title>
          <style>{$css}</style>
          <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
          <script src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
          <script>
            window.wp = window.wp || {};
            window.wp.element = window.React;
          </script>
          <script src="/scripts/fact-check-frontend.js" defer></script>
          <script src="/scripts/content-overview-frontend.js" defer></script>
          <script src="/scripts/author-profile-frontend.js" defer></script>
          <script src="/scripts/trending-items-frontend.js" defer></script>
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
            .pv-bar { background: #111827; color: #9ca3af; font-size: 11px; padding: 6px 24px; display: flex; align-items: center; gap: 8px; }
            .pv-bar strong { color: #fff; }
            .pv-bar code { background: #1f2937; padding: 1px 5px; border-radius: 3px; font-size: 10px; }
            .pv-flush { position: fixed; top: 10px; right: 12px; z-index: 9999; padding: 5px 13px; background: #1e40af; color: #fff; border-radius: 6px; font: 600 11px/1 sans-serif; text-decoration: none; }
            .pv-flush:hover { background: #1d4ed8; }
            .pv-wrap { width: 100%; margin: 0; padding: 2rem 0; }
          </style>
        </head>
        <body>
          <div class="pv-bar">
            <strong>VVP Divi Extensions Preview</strong>
            <span>rendered in {$took} ms</span>
            <span>·</span>
            <span>cache: <code>{$tmp_dir}/vvp_co_preview_*.cache</code></span>
          </div>
          <a href="?flush=1" class="pv-flush">⟳ Flush cache</a>
          <div class="pv-wrap">
            {$body}
          </div>
        </body>
        </html>
        HTML;
    }

} // end namespace {}
