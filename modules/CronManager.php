<?php
/**
 * WP-Cron scheduling for proactive cache warming of external API feeds.
 *
 * @package VVP\Divi5
 * @since 1.0.0
 */

namespace VVP\Divi5;

if (!defined('ABSPATH')) {
    die('Direct access forbidden.');
}

use VVP\Divi5\ContentOverview\ContentOverview;

class CronManager
{
    const HOOK     = 'vvp_warm_content_overview_cache';
    const INTERVAL = 'vvp_25min';

    /**
     * Register custom cron interval and hook the warming callback.
     * Call this on every request (e.g. from plugins_loaded).
     */
    public static function register(): void
    {
        add_filter('cron_schedules', [self::class, 'add_intervals']);
        add_action(self::HOOK, [ContentOverview::class, 'warm_caches']);
        self::schedule();
    }

    /**
     * Schedule the recurring event if not already scheduled.
     * Safe to call repeatedly — is a no-op when already scheduled.
     */
    public static function schedule(): void
    {
        if (!wp_next_scheduled(self::HOOK)) {
            wp_schedule_event(time(), self::INTERVAL, self::HOOK);
        }
    }

    /**
     * Clear the scheduled event. Called on plugin deactivation.
     */
    public static function deactivate(): void
    {
        wp_clear_scheduled_hook(self::HOOK);
    }

    /**
     * Add a 25-minute cron interval to WordPress.
     *
     * @param array $schedules Existing cron schedules.
     * @return array
     */
    public static function add_intervals(array $schedules): array
    {
        $schedules[self::INTERVAL] = [
            'interval' => 25 * MINUTE_IN_SECONDS,
            'display'  => 'Every 25 minutes',
        ];
        return $schedules;
    }
}
