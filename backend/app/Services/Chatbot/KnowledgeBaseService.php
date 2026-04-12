<?php

namespace App\Services\Chatbot;

class KnowledgeBaseService
{
    public function serviceCatalog(): array
    {
        return [
            'grooming' => [
                'title' => 'Grooming',
                'description' => 'Bathing, coat trimming, nail care, and hygiene packages for pets.',
            ],
            'veterinary' => [
                'title' => 'Veterinary',
                'description' => 'Checkups, vaccinations, consultations, and clinic support.',
            ],
            'boarding' => [
                'title' => 'Boarding',
                'description' => 'Pet hotel and supervised boarding stays with care monitoring.',
            ],
            'store' => [
                'title' => 'Store',
                'description' => 'Pet supplies, food, accessories, and wellness products.',
            ],
        ];
    }

    public function faq(): array
    {
        return [
            'hours' => 'Business hours are typically managed from the dashboard configuration, but the current bot can guide users to bookings, services, and support pages right away.',
            'contact' => 'You can direct users to the support and profile sections for contact information, booking follow-up, and account help.',
            'booking' => 'Bookings are handled through customer booking flows and receptionist scheduling tools. The chatbot can guide users to the correct module before automating more steps later.',
            'pricing' => 'Service prices come from the services module, so the chatbot should answer from backend service data instead of hardcoded frontend text.',
        ];
    }
}
