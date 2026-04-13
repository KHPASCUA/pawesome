<?php

namespace App\Services\Chatbot;

use App\Models\Appointment;
use App\Models\ChatbotFaq;
use App\Models\ChatbotLog;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\Pet;
use App\Models\Sale;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Carbon;

class ChatbotService
{
    public function __construct(
        private readonly RoleScopeService $roleScopeService,
        private readonly KnowledgeBaseService $knowledgeBaseService,
    ) {
    }

    public function welcome(?User $user): array
    {
        $config = $this->roleScopeService->getRoleConfig($user);
        $role = $this->roleScopeService->normalizeRole($user?->role);

        return [
            'message' => sprintf('Hello %s. %s', $config['label'], $config['welcome']),
            'intent' => 'welcome',
            'role' => $role,
            'scope' => $config['scope'],
            'suggestions' => $config['suggestions'],
        ];
    }

    public function respond(?User $user, string $message, string $channel = 'web'): array
    {
        $role = $this->roleScopeService->normalizeRole($user?->role);
        $config = $this->roleScopeService->getRoleConfig($user);
        $intent = $this->detectIntent($message);
        $faqResponse = $this->faqResponse($message, $role);

        if ($faqResponse) {
            $intent = 'faq';
            $response = $faqResponse;
        } else {
            $response = match ($intent) {
                'booking_help' => $this->bookingResponse($role),
                'pricing' => $this->pricingResponse($role),
                'services' => $this->servicesResponse($role),
                'summary' => $this->summaryResponse($role),
                'navigation' => $this->navigationResponse($role),
                'logs' => $this->logsResponse($role),
                'role_help' => $this->roleHelpResponse($role, $config),
                'support' => $this->supportResponse($role),
                default => $this->generalResponse($role, $config),
            };
        }

        $log = ChatbotLog::create([
            'user_id' => $user?->id,
            'role' => $role,
            'channel' => $channel,
            'type' => $this->mapIntentToType($intent),
            'intent' => $intent,
            'scope' => $config['scope'],
            'message' => $message,
            'response' => $response['message'],
            'user_message' => $message,
            'bot_response' => $response['message'],
            'metadata' => [
                'suggestions' => $response['suggestions'] ?? [],
                'actions' => $response['actions'] ?? [],
            ],
        ]);

        return [
            'id' => $log->id,
            'reply' => $response['message'],
            'intent' => $intent,
            'role' => $role,
            'scope' => $config['scope'],
            'suggestions' => $response['suggestions'] ?? [],
            'actions' => $response['actions'] ?? [],
        ];
    }

    private function detectIntent(string $message): string
    {
        $normalized = strtolower($message);

        return match (true) {
            str_contains($normalized, 'summary') || str_contains($normalized, 'overview') || str_contains($normalized, 'stats') || str_contains($normalized, 'status') || str_contains($normalized, 'how many') || str_contains($normalized, 'revenue') || str_contains($normalized, 'low stock') || str_contains($normalized, 'appointments today') => 'summary',
            str_contains($normalized, 'book') || str_contains($normalized, 'appointment') || str_contains($normalized, 'schedule') => 'booking_help',
            str_contains($normalized, 'price') || str_contains($normalized, 'cost') || str_contains($normalized, 'rate') || str_contains($normalized, 'fee') => 'pricing',
            str_contains($normalized, 'service') || str_contains($normalized, 'groom') || str_contains($normalized, 'vet') || str_contains($normalized, 'boarding') || str_contains($normalized, 'hotel') => 'services',
            str_contains($normalized, 'where') || str_contains($normalized, 'navigate') || str_contains($normalized, 'dashboard') || str_contains($normalized, 'shortcut') => 'navigation',
            str_contains($normalized, 'log') || str_contains($normalized, 'chat history') || str_contains($normalized, 'analytics') => 'logs',
            str_contains($normalized, 'role') || str_contains($normalized, 'permission') || str_contains($normalized, 'what can i do') => 'role_help',
            str_contains($normalized, 'help') || str_contains($normalized, 'support') || str_contains($normalized, 'contact') => 'support',
            default => 'general',
        };
    }

    private function bookingResponse(string $role): array
    {
        $messages = [
            'customer' => 'I can guide you to customer bookings, pets, and appointment tools. Use the bookings page for confirmed scheduling and the chatbot for quick guidance.',
            'receptionist' => 'Receptionists can manage appointments, check-ins, hotel bookings, and customer inquiries. Start from the bookings or appointments pages for operational work.',
            'veterinary' => 'Veterinary staff can use the appointments and patient views for clinical scheduling. The chatbot is best used for navigation and workflow prompts.',
        ];

        return [
            'message' => $messages[$role] ?? 'Booking guidance is available through the role-specific booking and appointment modules in your dashboard.',
            'suggestions' => [
                'Show dashboard shortcuts',
                'What services are available?',
                'How do I contact support?',
            ],
            'actions' => $this->bookingActions($role),
        ];
    }

    private function pricingResponse(string $role): array
    {
        $services = Service::query()
            ->orderBy('name')
            ->limit(6)
            ->get(['name', 'price']);

        if ($services->isEmpty()) {
            return [
                'message' => 'I could not find active service prices yet. Once service records are populated, I will answer with live backend pricing instead of static text.',
                'suggestions' => [
                    'Show services',
                    'Help me with bookings',
                    'Show dashboard summary',
                ],
            ];
        }

        $pricingText = $services
            ->map(fn (Service $service) => "{$service->name}: $" . number_format((float) $service->price, 2))
            ->implode(', ');

        return [
            'message' => "Current service pricing from the backend is {$pricingText}.",
            'suggestions' => [
                'Show services',
                'Help me with bookings',
                'Show dashboard summary',
            ],
            'actions' => [
                ['label' => 'Open services', 'path' => $role === 'customer' ? '/customer/bookings' : $this->basePathForRole($role)],
                ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
            ],
        ];
    }

    private function servicesResponse(string $role): array
    {
        $services = Service::query()
            ->orderBy('name')
            ->limit(8)
            ->get(['name', 'description', 'price']);

        if ($services->isNotEmpty()) {
            $catalog = $services
                ->map(function (Service $service) {
                    $description = $service->description ?: 'Service available in the system';

                    return "{$service->name} ($" . number_format((float) $service->price, 2) . "): {$description}";
                })
                ->implode(' ');
        } else {
            $catalog = collect($this->knowledgeBaseService->serviceCatalog())
                ->map(fn (array $item) => "{$item['title']}: {$item['description']}")
                ->implode(' ');
        }

        return [
            'message' => "Available service areas include {$catalog}",
            'suggestions' => [
                'Book an appointment',
                'Show service prices',
                'Show dashboard summary',
            ],
            'actions' => [
                ['label' => 'Open dashboard home', 'path' => $this->basePathForRole($role)],
                ['label' => 'Create booking', 'type' => 'workflow', 'workflow' => 'create_booking'],
            ],
        ];
    }

    private function summaryResponse(string $role): array
    {
        $today = Carbon::today();

        return match ($role) {
            'admin' => [
                'message' => sprintf(
                    'Admin summary: %d total users, %d active users, %d customers, %d appointments today, $%s revenue today, and %d low-stock items.',
                    User::count(),
                    User::where('is_active', true)->count(),
                    Customer::count(),
                    Appointment::whereDate('scheduled_at', $today)->count(),
                    number_format((float) Sale::whereDate('created_at', $today)->sum('amount'), 2),
                    InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
                ),
                'suggestions' => [
                    'Show chatbot log summary',
                    'Help me navigate reports',
                    'Show service prices',
                ],
                'actions' => [
                    ['label' => 'Open admin reports', 'path' => '/admin/reports'],
                    ['label' => 'Search inventory', 'type' => 'workflow', 'workflow' => 'inventory_search'],
                ],
            ],
            'manager' => [
                'message' => sprintf(
                    'Manager summary: %d staff accounts, %d active staff, %d appointments today, %d completed appointments, and $%s revenue this month.',
                    User::whereIn('role', ['receptionist', 'veterinary', 'inventory', 'cashier'])->count(),
                    User::whereIn('role', ['receptionist', 'veterinary', 'inventory', 'cashier'])->where('is_active', true)->count(),
                    Appointment::whereDate('scheduled_at', $today)->count(),
                    Appointment::where('status', 'completed')->count(),
                    number_format((float) Sale::whereMonth('created_at', $today->month)->sum('amount'), 2),
                ),
                'suggestions' => [
                    'Give me manager shortcuts',
                    'Help me navigate staff reports',
                    'Show services',
                ],
                'actions' => [
                    ['label' => 'Open manager reports', 'path' => '/manager/reports'],
                    ['label' => 'Search inventory', 'type' => 'workflow', 'workflow' => 'inventory_search'],
                ],
            ],
            'receptionist' => [
                'message' => sprintf(
                    'Reception summary: %d appointments today, %d pending appointments, %d confirmed appointments, %d total customers, and %d pets in the system.',
                    Appointment::whereDate('scheduled_at', $today)->count(),
                    Appointment::where('status', 'scheduled')->count(),
                    Appointment::where('status', 'confirmed')->count(),
                    Customer::count(),
                    Pet::count(),
                ),
                'suggestions' => [
                    'Help me with bookings',
                    'What can I answer for customers?',
                    'Show service prices',
                ],
                'actions' => [
                    ['label' => 'Open appointments', 'path' => '/receptionist/appointments'],
                    ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
                ],
            ],
            'veterinary' => [
                'message' => sprintf(
                    'Veterinary summary: %d appointments today, %d pending appointments, %d completed appointments, and %d patient records.',
                    Appointment::whereDate('scheduled_at', $today)->count(),
                    Appointment::where('status', 'scheduled')->count(),
                    Appointment::where('status', 'completed')->count(),
                    Pet::count(),
                ),
                'suggestions' => [
                    'Show veterinary shortcuts',
                    'Help me navigate appointments',
                    'Show services',
                ],
                'actions' => [
                    ['label' => 'Open vet appointments', 'path' => '/veterinary/appointments'],
                    ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
                ],
            ],
            'cashier' => [
                'message' => sprintf(
                    'Cashier summary: $%s sales today from %d transactions, $%s sales this month, and %d pending payment-related appointments.',
                    number_format((float) Sale::whereDate('created_at', $today)->sum('amount'), 2),
                    Sale::whereDate('created_at', $today)->count(),
                    number_format((float) Sale::whereMonth('created_at', $today->month)->sum('amount'), 2),
                    Appointment::where('status', 'confirmed')->count(),
                ),
                'suggestions' => [
                    'Show cashier shortcuts',
                    'Help me find transactions',
                    'Show service prices',
                ],
                'actions' => [
                    ['label' => 'Open transactions', 'path' => '/cashier/transactions'],
                    ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
                ],
            ],
            'inventory' => [
                'message' => sprintf(
                    'Inventory summary: %d total items, %d low-stock items, %d out-of-stock items, and stock value of $%s.',
                    InventoryItem::count(),
                    InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
                    InventoryItem::where('stock', 0)->count(),
                    number_format((float) (InventoryItem::selectRaw('COALESCE(SUM(stock * price), 0) as total')->value('total') ?? 0), 2),
                ),
                'suggestions' => [
                    'Show inventory shortcuts',
                    'How do I monitor low stock?',
                    'Show dashboard summary',
                ],
                'actions' => [
                    ['label' => 'Open stock page', 'path' => '/inventory/stock'],
                    ['label' => 'Search inventory', 'type' => 'workflow', 'workflow' => 'inventory_search'],
                ],
            ],
            'customer' => [
                'message' => sprintf(
                    'Customer summary: there are %d service offerings, %d available pet records in the system, and I can guide you to bookings, pets, payments, and support.',
                    Service::count(),
                    Pet::count(),
                ),
                'suggestions' => [
                    'Book an appointment',
                    'Show service prices',
                    'What are your hours?',
                ],
                'actions' => [
                    ['label' => 'Open my bookings', 'path' => '/customer/bookings'],
                    ['label' => 'Create booking', 'type' => 'workflow', 'workflow' => 'create_booking'],
                    ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
                ],
            ],
            default => [
                'message' => 'I can provide live system summaries once you are authenticated into a role-based dashboard.',
                'suggestions' => [
                    'What can you help with?',
                    'Show me available services',
                    'How do I contact support?',
                ],
            ],
        };
    }

    private function navigationResponse(string $role): array
    {
        $destinations = [
            'admin' => ['Users' => '/admin/users', 'Reports' => '/admin/reports', 'Chatbot Logs' => '/admin/chatbot'],
            'manager' => ['Overview' => '/manager', 'Reports' => '/manager/reports', 'Staff' => '/manager/staff'],
            'receptionist' => ['Appointments' => '/receptionist/appointments', 'Bookings' => '/receptionist/bookings', 'Customers' => '/receptionist/customers'],
            'veterinary' => ['Appointments' => '/veterinary/appointments', 'History' => '/veterinary/history', 'Profile' => '/veterinary/profile'],
            'cashier' => ['Transactions' => '/cashier/transactions', 'Reports' => '/cashier/reports', 'POS' => '/cashier/pos'],
            'inventory' => ['Products' => '/inventory/products', 'Stock' => '/inventory/stock', 'Reports' => '/inventory/reports'],
            'customer' => ['Bookings' => '/customer/bookings', 'Pets' => '/customer/pets', 'Store' => '/customer/store'],
        ];

        $items = collect($destinations[$role] ?? ['Dashboard' => $this->basePathForRole($role)])
            ->map(fn (string $path, string $label) => "{$label} ({$path})")
            ->implode(', ');

        return [
            'message' => "Here are useful {$role} routes: {$items}.",
            'suggestions' => [
                'What can I do in my role?',
                'Help me with bookings',
                'Show service areas',
            ],
        ];
    }

    private function logsResponse(string $role): array
    {
        if ($role !== 'admin') {
            return [
                'message' => 'Chatbot logs and analytics are restricted to admins, but your conversations are still being tracked for support and reporting.',
                'suggestions' => [
                    'What can I do in my role?',
                    'Help me navigate',
                    'Contact support',
                ],
            ];
        }

        return [
            'message' => 'Admins can review chatbot summaries, per-user conversations, and unanswered usage patterns from the Chatbot Logs dashboard.',
            'suggestions' => [
                'Show chatbot log summary',
                'Help me navigate reports',
                'What can admins do with the chatbot?',
            ],
            'actions' => [
                ['label' => 'Open chatbot logs', 'path' => '/admin/chatbot'],
            ],
        ];
    }

    private function roleHelpResponse(string $role, array $config): array
    {
        return [
            'message' => sprintf(
                'Your current role is %s. The chatbot scope for this role is %s and it focuses on %s',
                $config['label'],
                $config['scope'],
                $config['welcome']
            ),
            'suggestions' => $config['suggestions'],
            'actions' => [
                ['label' => 'Open dashboard', 'path' => $this->basePathForRole($role)],
            ],
        ];
    }

    private function supportResponse(string $role): array
    {
        $faq = $this->knowledgeBaseService->faq();

        return [
            'message' => "{$faq['contact']} {$faq['booking']}",
            'suggestions' => [
                'Show dashboard shortcuts',
                'Book an appointment',
                'Show dashboard summary',
            ],
            'actions' => [
                ['label' => 'Open profile', 'path' => $this->routeForRole($role, 'profile')],
                ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
            ],
        ];
    }

    private function generalResponse(string $role, array $config): array
    {
        return [
            'message' => "I am your shared {$config['label']} assistant. {$config['welcome']}",
            'suggestions' => $config['suggestions'],
            'actions' => [
                ['label' => 'Open dashboard', 'path' => $this->basePathForRole($role)],
                ...$this->generalActions($role),
            ],
        ];
    }

    private function faqResponse(string $message, string $role): ?array
    {
        $normalized = strtolower($message);
        $faqs = ChatbotFaq::query()
            ->where('is_active', true)
            ->whereIn('scope', ['general', $role])
            ->orderBy('sort_order')
            ->get();

        foreach ($faqs as $faq) {
            $question = strtolower($faq->question);
            $keywords = collect($faq->keywords ?? [])->map(fn ($keyword) => strtolower($keyword));
            $matchesQuestion = str_contains($normalized, $question) || str_contains($question, $normalized);
            $matchesKeyword = $keywords->contains(fn ($keyword) => $keyword !== '' && str_contains($normalized, $keyword));

            if ($matchesQuestion || $matchesKeyword) {
                return [
                    'message' => $faq->answer,
                    'suggestions' => [
                        'Show dashboard summary',
                        'Help me navigate',
                        'What services are available?',
                    ],
                ];
            }
        }

        return null;
    }

    private function bookingActions(string $role): array
    {
        $actions = [
            ['label' => 'Open bookings', 'path' => $this->routeForRole($role, 'bookings')],
            ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
        ];

        if ($role === 'customer') {
            $actions[] = ['label' => 'Create booking', 'type' => 'workflow', 'workflow' => 'create_booking'];
        }

        return $actions;
    }

    private function generalActions(string $role): array
    {
        return match ($role) {
            'customer' => [
                ['label' => 'Create booking', 'type' => 'workflow', 'workflow' => 'create_booking'],
                ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
            ],
            'admin', 'inventory', 'manager' => [
                ['label' => 'Search inventory', 'type' => 'workflow', 'workflow' => 'inventory_search'],
            ],
            default => [
                ['label' => 'Look up appointments', 'type' => 'workflow', 'workflow' => 'appointment_lookup'],
            ],
        };
    }

    private function mapIntentToType(string $intent): string
    {
        return match ($intent) {
            'booking_help' => 'booking',
            default => 'general',
        };
    }

    private function basePathForRole(string $role): string
    {
        return match ($role) {
            'admin' => '/admin',
            'manager' => '/manager',
            'receptionist' => '/receptionist',
            'veterinary' => '/veterinary',
            'cashier' => '/cashier',
            'inventory' => '/inventory',
            'customer' => '/customer',
            default => '/dashboard',
        };
    }

    private function routeForRole(string $role, string $section): string
    {
        $routes = [
            'admin' => [
                'profile' => '/admin/profile',
                'bookings' => '/admin',
            ],
            'manager' => [
                'profile' => '/manager/profile',
                'bookings' => '/manager',
            ],
            'receptionist' => [
                'profile' => '/receptionist/profile',
                'bookings' => '/receptionist/bookings',
            ],
            'veterinary' => [
                'profile' => '/veterinary/profile',
                'bookings' => '/veterinary/appointments',
            ],
            'cashier' => [
                'profile' => '/cashier/profile',
                'bookings' => '/cashier/transactions',
            ],
            'inventory' => [
                'profile' => '/inventory/profile',
                'bookings' => '/inventory/stock',
            ],
            'customer' => [
                'profile' => '/customer/profile',
                'bookings' => '/customer/bookings',
            ],
        ];

        return $routes[$role][$section] ?? $this->basePathForRole($role);
    }
}
