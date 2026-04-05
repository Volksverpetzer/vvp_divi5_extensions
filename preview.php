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

    function wp_remote_get(string $url, array $args = []): array|WP_Error
    {
        if (!extension_loaded('curl')) {
            return new WP_Error('curl extension not available');
        }
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => (int)($args['timeout'] ?? 15),
            CURLOPT_USERAGENT      => $args['user-agent'] ?? 'VVP-Preview/1.0',
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_ENCODING       => '',
            CURLOPT_HTTPHEADER     => ['Accept: application/json, text/xml, */*'],
        ]);
        $body = curl_exec($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        @curl_close($ch); // deprecated no-op in PHP 8.5+

        if ($err || $body === false) {
            return new WP_Error($err ?: "cURL failed for {$url}");
        }
        return ['body' => $body, 'response' => ['code' => $code]];
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

} // end namespace {}

// ── ContentOverview namespace: stub + preview wrapper ────────────────────────
namespace VVP\FactCheckSearch\ContentOverview {

    // Stub the self-reference used in render_callback() (not called in preview)
    class ContentOverview {}

    // Load the real trait (defines VVP\FactCheckSearch\ContentOverview\ContentOverviewTrait\RenderCallbackTrait)
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

} // end namespace VVP\FactCheckSearch\ContentOverview

// ── Back to global: render + output ──────────────────────────────────────────
namespace {

    $t0       = microtime(true);
    $overview = \VVP\FactCheckSearch\ContentOverview\ContentOverviewPreview::render();
    
    $body     = '<h2>Fact Check Search Module</h2>';
    $body    .= '<div class="vvp-fc__mount" data-search-url="" data-import-url="" style="margin-bottom: 2rem;"></div>';
    $body    .= '<div style="margin: 3rem 0; padding-top: 3rem; border-top: 2px dashed #e5e7eb;">';
    $body    .= $overview;
    $body    .= '</div>';

    $took     = round((microtime(true) - $t0) * 1000);
    $tmp_dir = sys_get_temp_dir();

    $css = file_exists(__DIR__ . '/styles/main.css')
        ? file_get_contents(__DIR__ . '/styles/main.css')
        : '';

    // ── Serve static assets (slider JS) ──────────────────────────────────────
    $req_path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
    if ($req_path === '/slider.js') {
        $slider_file = __DIR__ . '/Divi/includes/builder-5/visual-builder/build/script-library-slider.js';
        if (file_exists($slider_file)) {
            header('Content-Type: application/javascript; charset=UTF-8');
            header('Cache-Control: public, max-age=3600');
            readfile($slider_file);
        } else {
            http_response_code(404);
            echo '/* slider.js not found */';
        }
        exit;
    }

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
          <title>ContentOverview — Preview</title>
          <style>{$css}</style>
          <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
          <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
          <script>
            window.wp = window.wp || {};
            window.wp.element = window.React;
            window.wp.element.render = window.ReactDOM.render;
          </script>
          <script src="/slider.js" defer></script>
          <script src="/scripts/fact-check-frontend.js" defer></script>
          <script src="/scripts/content-overview-frontend.js" defer></script>
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; color: #111827; }
            .pv-bar { background: #111827; color: #9ca3af; font-size: 11px; padding: 6px 24px; display: flex; align-items: center; gap: 8px; }
            .pv-bar strong { color: #fff; }
            .pv-bar code { background: #1f2937; padding: 1px 5px; border-radius: 3px; font-size: 10px; }
            .pv-flush { position: fixed; top: 10px; right: 12px; z-index: 9999; padding: 5px 13px; background: #1e40af; color: #fff; border-radius: 6px; font: 600 11px/1 sans-serif; text-decoration: none; }
            .pv-flush:hover { background: #1d4ed8; }
            .pv-wrap { max-width: 80rem; margin: 0 auto; padding: 2rem 1.5rem; }
          </style>
        </head>
        <body>
          <div class="pv-bar">
            <strong>ContentOverview Preview</strong>
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
