<?php
/**
 * Feed row grouping logic.
 *
 * @package VVP\Divi5\ContentOverview
 * @since 1.0.0
 */

namespace VVP\Divi5\ContentOverview\ContentOverviewTrait;

trait FeedGroupTrait
{
    /**
     * Group flat feed items into rows of a given size.
     *
     * Rules:
     * - Instagram items are batched into their own rows (never mixed with other kinds).
     * - Podcast and YouTube banners are full-width and always occupy their own single-item row.
     * - All other items (articles) share rows.
     * - Leftover partial rows and all completed rows are sorted newest-first by
     *   the date of the first item in each row.
     *
     * @param array $items    Flat array of feed items: ['kind', 'date' (DateTime), 'data'].
     * @param int   $row_size Items per row (typically 3).
     *
     * @return array Array of rows: [['items' => [...], 'date' => DateTime], ...].
     */
    private static function group_feed_rows(array $items, int $row_size = 3): array
    {
        $insta_queue = [];
        $mixed_queue = [];
        $grouped     = [];

        $flush_chunk = function (array &$queue, int $size) use (&$grouped) {
            if (count($queue) < $size) {
                return;
            }
            $chunk     = array_splice($queue, 0, $size);
            $grouped[] = ['items' => $chunk, 'date' => $chunk[0]['date']];
        };

        foreach ($items as $item) {
            if ('insta' === $item['kind']) {
                $insta_queue[] = $item;
                $flush_chunk($insta_queue, $row_size);
                continue;
            }

            // Podcast and YouTube banners are full-width and always occupy their own single-item row.
            if ('podcast_banner' === $item['kind'] || 'youtube_banner' === $item['kind']) {
                $grouped[] = ['items' => [$item], 'date' => $item['date']];
                continue;
            }

            $mixed_queue[] = $item;
            $flush_chunk($mixed_queue, $row_size);
        }

        // Flush partial leftover queues, sorted among themselves newest-first.
        $leftover_groups = [];
        if (!empty($insta_queue)) {
            $leftover_groups[] = ['kind' => 'insta', 'items' => $insta_queue];
        }
        if (!empty($mixed_queue)) {
            $leftover_groups[] = ['kind' => 'mixed', 'items' => $mixed_queue];
        }

        usort($leftover_groups, function ($a, $b) {
            return $b['items'][0]['date']->getTimestamp() - $a['items'][0]['date']->getTimestamp();
        });

        foreach ($leftover_groups as $group) {
            $grouped[] = ['items' => $group['items'], 'date' => $group['items'][0]['date']];
        }

        // Sort all rows (completed + leftovers) newest-first.
        usort($grouped, function ($a, $b) {
            return $b['date']->getTimestamp() - $a['date']->getTimestamp();
        });

        // Ensure the first row is never Instagram-only content.
        if (!empty($grouped) && isset($grouped[0]['items'][0]['kind']) && 'insta' === $grouped[0]['items'][0]['kind']) {
            foreach ($grouped as $i => $row) {
                if ('insta' !== $row['items'][0]['kind']) {
                    array_unshift($grouped, array_splice($grouped, $i, 1)[0]);
                    break;
                }
            }
        }

        return $grouped;
    }
}
