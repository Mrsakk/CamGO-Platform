<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

class PerformanceHeadersTest extends BaseTestCase
{
    /**
     * Test public GET endpoints return ETag, Server-Timing, and public Cache-Control.
     */
    public function test_public_endpoint_returns_etag_and_server_timing(): void
    {
        $response = $this->getJson('/api/v1/home');

        $response->assertStatus(200);
        $this->assertTrue($response->headers->has('ETag'), 'Response missing ETag header');
        $this->assertTrue($response->headers->has('Server-Timing'), 'Response missing Server-Timing header');
        $cacheControl = $response->headers->get('Cache-Control');
        $this->assertStringContainsString('public', $cacheControl, 'Public endpoint Cache-Control must contain public');
    }

    /**
     * Test If-None-Match matching ETag returns 304 Not Modified with empty body.
     */
    public function test_etag_returns_304_not_modified(): void
    {
        $initialResponse = $this->getJson('/api/v1/home');
        $initialResponse->assertStatus(200);
        $etag = $initialResponse->headers->get('ETag');

        $this->assertNotEmpty($etag);

        $conditionalResponse = $this->withHeaders([
            'If-None-Match' => $etag,
        ])->get('/api/v1/home');

        $this->assertEquals(304, $conditionalResponse->getStatusCode());
        $this->assertEmpty($conditionalResponse->getContent());
    }

    /**
     * Test private endpoints never send public Cache-Control headers.
     */
    public function test_private_endpoint_is_never_publicly_cached(): void
    {
        $response = $this->getJson('/api/v1/profile');

        $cacheControl = $response->headers->get('Cache-Control');
        $this->assertStringNotContainsString('public', (string) $cacheControl);
    }
}
