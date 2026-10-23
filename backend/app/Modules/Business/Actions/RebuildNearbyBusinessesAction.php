<?php

namespace App\Modules\Business\Actions;

use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\NearbyBusiness;

class RebuildNearbyBusinessesAction
{
    public function execute(int $limit = 10): int
    {
        $businesses = Business::query()
            ->published()
            ->whereNotNull('lat')
            ->whereNotNull('lng')
            ->get(['id', 'slug', 'lat', 'lng']);

        $written = 0;

        foreach ($businesses as $business) {
            $distances = [];

            foreach ($businesses as $other) {
                if ($business->id === $other->id) {
                    continue;
                }

                $distance = $this->haversine(
                    (float) $business->lat,
                    (float) $business->lng,
                    (float) $other->lat,
                    (float) $other->lng
                );

                if ($distance <= 50.0) {
                    $distances[] = [
                        'business_id' => $business->id,
                        'nearby_business_id' => $other->id,
                        'distance_km' => round($distance, 2),
                    ];
                }
            }

            usort($distances, fn (array $a, array $b) => $a['distance_km'] <=> $b['distance_km']);

            NearbyBusiness::where('business_id', $business->id)->delete();

            foreach (array_slice($distances, 0, $limit) as $row) {
                NearbyBusiness::create($row);
                $written++;
            }
        }

        return $written;
    }

    private function haversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return $earthRadius * (2 * atan2(sqrt($a), sqrt(1 - $a)));
    }
}
