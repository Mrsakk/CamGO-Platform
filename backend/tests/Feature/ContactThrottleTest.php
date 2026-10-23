<?php

namespace Tests\Feature;

use Tests\TestCase;

class ContactThrottleTest extends TestCase
{
    public function test_contact_form_saves_message_successfully(): void
    {
        $payload = [
            'name' => 'Sokha Traveler',
            'email' => 'sokha_test_' . time() . '@example.com',
            'phone' => '+85512345678',
            'subject' => 'Tour Inquiry',
            'message' => 'Hello, I would like to inquire about guided tours to Preah Vihear temple.',
        ];

        $response = $this->postJson('/api/v1/contact', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('contact_messages', [
            'email' => $payload['email'],
            'subject' => 'Tour Inquiry',
        ]);
    }
}
