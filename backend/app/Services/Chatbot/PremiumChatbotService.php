<?php

namespace App\Services\Chatbot;

use App\Models\Appointment;
use App\Models\ChatbotFaq;
use App\Models\ChatbotLog;
use App\Models\Customer;
use App\Models\HotelRoom;
use App\Models\InventoryItem;
use App\Models\Pet;
use App\Models\Sale;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Premium Chatbot Service - Professional Grade
 * 
 * Features:
 * - Advanced NLP intent detection
 * - Context-aware responses
 * - Rich content with emojis and formatting
 * - Proactive suggestions
 * - Multi-turn conversation support
 * - Professional tone across all roles
 */
class PremiumChatbotService
{
    private AiChatbotService $aiService;
    private array $conversationContext = [];
    
    public function __construct(
        private readonly RoleScopeService $roleScopeService,
        private readonly KnowledgeBaseService $knowledgeBaseService,
    ) {
        $this->aiService = new AiChatbotService();
    }

    /**
     * Premium Welcome Message
     */
    public function welcome(?User $user): array
    {
        $config = $this->roleScopeService->getRoleConfig($user);
        $role = $this->roleScopeService->normalizeRole($user?->role);
        
        $greetings = [
            'admin' => "👋 Welcome back, Administrator! Ready to manage Pawesome operations?",
            'manager' => "👋 Hello, Manager! Let's review today's business performance.",
            'cashier' => "👋 Good day! I'm here to help with POS and transactions.",
            'receptionist' => "👋 Welcome! Ready to assist with appointments and check-ins?",
            'veterinary' => "👋 Hello, Doctor! Accessing medical records and appointments.",
            'customer' => "🐾 Welcome to Pawesome! How can I help you and your pet today?",
            'guest' => "🐾 Welcome to Pawesome Pet Services! How may I assist you?",
        ];
        
        return [
            'reply' => $greetings[$role] ?? $greetings['guest'],
            'intent' => 'welcome',
            'role' => $role,
            'scope' => $config['scope'],
            'suggestions' => $this->getWelcomeSuggestions($role),
            'rich_content' => $this->getWelcomeRichContent($role),
            'actions' => $this->getQuickActions($role),
            'source' => 'rule_based',
            'confidence' => 1.0,
            'metadata' => [
                'timestamp' => now()->toIso8601String(),
                'session_id' => uniqid('chat_', true),
            ],
        ];
    }

    /**
     * Premium Response Handler
     */
    public function respond(?User $user, string $message, string $channel = 'web'): array
    {
        $role = $this->roleScopeService->normalizeRole($user?->role);
        $config = $this->roleScopeService->getRoleConfig($user);
        $intent = $this->detectIntentAdvanced($message);
        
        // Check FAQ first for precise answers
        $faqResponse = $this->enhancedFaqResponse($message, $role);
        if ($faqResponse && $faqResponse['confidence'] > 0.8) {
            return $this->formatResponse($faqResponse, $role, $channel, $intent);
        }
        
        // Get contextual response based on intent
        $response = match ($intent) {
            'greeting' => $this->greetingResponse($role, $user),
            'farewell' => $this->farewellResponse($role),
            'gratitude' => $this->gratitudeResponse($role),
            'summary' => $this->premiumSummaryResponse($role),
            'hotel_booking' => $this->premiumHotelResponse($role),
            'booking_help' => $this->premiumBookingResponse($role),
            'pricing' => $this->premiumPricingResponse($role),
            'services' => $this->premiumServicesResponse($role),
            'inventory' => $this->premiumInventoryResponse($role, $message),
            'navigation' => $this->premiumNavigationResponse($role),
            'support' => $this->premiumSupportResponse($role),
            'emergency' => $this->emergencyResponse($role),
            'operating_hours' => $this->operatingHoursResponse($role),
            'location' => $this->locationResponse($role),
            'contact' => $this->contactResponse($role),
            'feedback' => $this->feedbackResponse($role),
            'complaint' => $this->complaintResponse($role),
            default => $this->defaultResponse($role, $message),
        };
        
        // Store context for follow-up
        $this->storeContext($user?->id, $intent, $message);
        
        return $this->formatResponse($response, $role, $channel, $intent);
    }

    /**
     * Advanced Intent Detection with NLP Patterns
     */
    private function detectIntentAdvanced(string $message): string
    {
        $normalized = strtolower(trim($message));
        
        // Greeting patterns
        if (preg_match('/^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)/i', $normalized)) {
            return 'greeting';
        }
        
        // Farewell patterns
        if (preg_match('/(bye|goodbye|see\s+you|farewell|thanks?\s*(bye)?)/i', $normalized)) {
            return 'farewell';
        }
        
        // Gratitude patterns
        if (preg_match('/(thank|thanks?|appreciate|grateful)/i', $normalized)) {
            return 'gratitude';
        }
        
        // Emergency patterns
        if (preg_match('/(emergency|urgent|critical|help\s*now|my\s*pet\s*is\s*sick)/i', $normalized)) {
            return 'emergency';
        }
        
        // Operating hours
        if (preg_match('/(hours?|open|close|time|when.*open|business\s*hours|operating)/i', $normalized)) {
            return 'operating_hours';
        }
        
        // Location
        if (preg_match('/(where|location|address|direction|find\s*you|located)/i', $normalized)) {
            return 'location';
        }
        
        // Contact
        if (preg_match('/(contact|call|phone|number|email|reach)/i', $normalized)) {
            return 'contact';
        }
        
        // Inventory search
        if (preg_match('/(stock|available|have\s*you.*(food|toy|shampoo|medicine|product)|do\s*you\s*have|inventory)/i', $normalized)) {
            return 'inventory';
        }
        
        // Pricing
        if (preg_match('/(how\s*much|price|cost|rate|fee|charge|expensive|cheap|discount)/i', $normalized)) {
            return 'pricing';
        }
        
        // Hotel/Booking
        if (preg_match('/(hotel|boarding|stay|room|overnight|sleep|accommodation|pet\s*hotel)/i', $normalized)) {
            return 'hotel_booking';
        }
        
        // Appointment/Booking
        if (preg_match('/(book|appointment|schedule|reserve|slot|when\s*can\s*i|available\s*time)/i', $normalized)) {
            return 'booking_help';
        }
        
        // Services
        if (preg_match('/(service|groom|vaccine|checkup|consultation|treatment|surgery|dental|spa)/i', $normalized)) {
            return 'services';
        }
        
        // Summary/Stats
        if (preg_match('/(summary|overview|stats|report|today\s*so\s*far|how\s*many|revenue|sales)/i', $normalized)) {
            return 'summary';
        }
        
        // Navigation
        if (preg_match('/(where\s*is|how\s*to|navigate|go\s*to|find|page|dashboard|menu)/i', $normalized)) {
            return 'navigation';
        }
        
        // Support/Help
        if (preg_match('/(help|support|assist|question|how\s*do\s*i|what\s*can\s*you)/i', $normalized)) {
            return 'support';
        }
        
        // Feedback
        if (preg_match('/(feedback|review|suggest|improve|rate|experience)/i', $normalized)) {
            return 'feedback';
        }
        
        // Complaint
        if (preg_match('/(complaint|problem|issue|bad|terrible|worst|angry|unhappy|dissatisfied)/i', $normalized)) {
            return 'complaint';
        }
        
        return 'general';
    }

    /**
     * Enhanced FAQ Response with Confidence Score
     */
    private function enhancedFaqResponse(string $message, string $role): ?array
    {
        $normalizedMessage = strtolower($message);
        
        // Search for matching FAQ
        $faq = ChatbotFaq::where('is_active', true)
            ->where(function ($query) use ($normalizedMessage) {
                $query->whereRaw('LOWER(question) LIKE ?', ['%' . $normalizedMessage . '%'])
                    ->orWhereRaw('LOWER(keywords) LIKE ?', ['%' . $normalizedMessage . '%']);
            })
            ->first();
        
        if ($faq) {
            return [
                'message' => $faq->answer,
                'confidence' => 0.9,
                'source' => 'faq',
                'faq_id' => $faq->id,
                'suggestions' => $this->getRelatedSuggestions($faq->category),
            ];
        }
        
        // Try AI service if enabled
        if ($this->aiService->isEnabled()) {
            $aiResponse = $this->aiService->generateResponse($message, $role);
            if ($aiResponse) {
                return [
                    'message' => $aiResponse,
                    'confidence' => 0.75,
                    'source' => 'ai',
                ];
            }
        }
        
        return null;
    }

    /**
     * Premium Greeting Response
     */
    private function greetingResponse(string $role, ?User $user): array
    {
        $hour = now()->hour;
        $timeOfDay = match (true) {
            $hour < 12 => 'morning',
            $hour < 17 => 'afternoon',
            default => 'evening',
        };
        
        $greetings = [
            'admin' => "Good {$timeOfDay}, Administrator! Dashboard ready for your review.",
            'manager' => "Good {$timeOfDay}, Manager! Here's your business overview.",
            'cashier' => "Good {$timeOfDay}! POS system standing by.",
            'receptionist' => "Good {$timeOfDay}! Front desk system active.",
            'veterinary' => "Good {$timeOfDay}, Doctor! Medical records accessible.",
            'customer' => "Good {$timeOfDay}! 🐾 Ready to help with your pet care needs!",
            'guest' => "Good {$timeOfDay}! Welcome to Pawesome Pet Services!",
        ];
        
        return [
            'message' => $greetings[$role] ?? $greetings['guest'],
            'confidence' => 1.0,
            'suggestions' => $this->getWelcomeSuggestions($role),
        ];
    }

    /**
     * Premium Summary Response with Rich Data
     */
    private function premiumSummaryResponse(string $role): array
    {
        $today = Carbon::today();
        $now = now();
        
        $data = match ($role) {
            'admin' => [
                'users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'customers' => Customer::count(),
                'appointments_today' => Appointment::whereDate('scheduled_at', $today)->count(),
                'revenue_today' => Sale::whereDate('created_at', $today)->sum('amount'),
                'low_stock' => InventoryItem::whereColumn('stock', '<=', 'reorder_level')->count(),
                'pending_appointments' => Appointment::where('status', 'pending')->count(),
            ],
            'manager' => [
                'staff_total' => User::whereIn('role', ['receptionist', 'veterinary', 'cashier'])->count(),
                'staff_active' => User::whereIn('role', ['receptionist', 'veterinary', 'cashier'])->where('is_active', true)->count(),
                'appointments_today' => Appointment::whereDate('scheduled_at', $today)->count(),
                'completed_today' => Appointment::whereDate('scheduled_at', $today)->where('status', 'completed')->count(),
                'revenue_month' => Sale::whereMonth('created_at', $today->month)->sum('amount'),
                'revenue_today' => Sale::whereDate('created_at', $today)->sum('amount'),
            ],
            'cashier' => [
                'transactions_today' => Sale::whereDate('created_at', $today)->count(),
                'revenue_today' => Sale::whereDate('created_at', $today)->sum('amount'),
                'avg_transaction' => Sale::whereDate('created_at', $today)->avg('amount') ?? 0,
            ],
            'receptionist' => [
                'appointments_today' => Appointment::whereDate('scheduled_at', $today)->count(),
                'check_ins_pending' => Appointment::where('status', 'confirmed')->whereDate('scheduled_at', $today)->count(),
                'new_customers_today' => Customer::whereDate('created_at', $today)->count(),
                'hotel_checkins' => \App\Models\Boarding::whereDate('check_in', $today)->count(),
            ],
            'veterinary' => [
                'appointments_today' => Appointment::whereDate('scheduled_at', $today)->where('veterinarian_id', auth()->id())->count(),
                'consultations_pending' => Appointment::where('status', 'scheduled')->whereDate('scheduled_at', $today)->count(),
                'patients_total' => Pet::count(),
            ],
            default => [],
        };
        
        $message = $this->formatSummaryMessage($role, $data);
        
        return [
            'message' => $message,
            'confidence' => 1.0,
            'rich_content' => [
                'type' => 'dashboard_summary',
                'data' => $data,
                'updated_at' => $now->toIso8601String(),
            ],
            'suggestions' => $this->getSummarySuggestions($role),
        ];
    }

    /**
     * Format Summary Message with Professional Styling
     */
    private function formatSummaryMessage(string $role, array $data): string
    {
        return match ($role) {
            'admin' => "📊 **Admin Dashboard Summary**\n\n" .
                "👥 **Users:** {$data['users']} total ({$data['active_users']} active)\n" .
                "🐕 **Customers:** {$data['customers']}\n" .
                "📅 **Today's Appointments:** {$data['appointments_today']}\n" .
                "⏳ **Pending:** {$data['pending_appointments']}\n" .
                "💰 **Today's Revenue:** ₱" . number_format($data['revenue_today'], 2) . "\n" .
                "⚠️ **Low Stock Items:** {$data['low_stock']}",
            
            'manager' => "📈 **Manager Performance Dashboard**\n\n" .
                "👥 **Staff:** {$data['staff_total']} ({$data['staff_active']} active)\n" .
                "📅 **Appointments Today:** {$data['appointments_today']} ({$data['completed_today']} completed)\n" .
                "💰 **Today's Revenue:** ₱" . number_format($data['revenue_today'], 2) . "\n" .
                "📊 **Monthly Revenue:** ₱" . number_format($data['revenue_month'], 2),
            
            'cashier' => "💵 **Cashier POS Summary**\n\n" .
                "🧾 **Transactions Today:** {$data['transactions_today']}\n" .
                "💰 **Total Revenue:** ₱" . number_format($data['revenue_today'], 2) . "\n" .
                "📊 **Average Transaction:** ₱" . number_format($data['avg_transaction'], 2),
            
            'receptionist' => "🎯 **Reception Dashboard**\n\n" .
                "📅 **Today's Appointments:** {$data['appointments_today']}\n" .
                "✅ **Ready for Check-in:** {$data['check_ins_pending']}\n" .
                "🏨 **Hotel Check-ins Today:** {$data['hotel_checkins']}\n" .
                "👋 **New Customers:** {$data['new_customers_today']}",
            
            'veterinary' => "🏥 **Veterinary Dashboard**\n\n" .
                "📅 **Your Appointments Today:** {$data['appointments_today']}\n" .
                "⏳ **Pending Consultations:** {$data['consultations_pending']}\n" .
                "🐾 **Total Patients:** {$data['patients_total']}",
            
            default => "Dashboard summary available for your role.",
        };
    }

    /**
     * Premium Hotel Response
     */
    private function premiumHotelResponse(string $role): array
    {
        $availableRooms = HotelRoom::where('status', 'available')->get();
        $totalRooms = HotelRoom::count();
        $occupiedRooms = HotelRoom::where('status', 'occupied')->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100) : 0;
        $activeBoarders = \App\Models\Boarding::where('status', 'checked_in')->count();
        
        $roomTypes = $availableRooms->groupBy('type')->map(fn($rooms) => $rooms->count());
        
        $message = match ($role) {
            'customer' => "🏨 **Pet Hotel Services**\n\n" .
                "We currently have **{$availableRooms->count()} rooms available**!\n\n" .
                "**Room Types Available:**\n" .
                $roomTypes->map(fn($count, $type) => "• {$type}: {$count} rooms")->implode("\n") .
                "\n\n**Current Occupancy:** {$occupancyRate}%\n" .
                "**Pets Currently Staying:** {$activeBoarders}\n\n" .
                "Would you like to book a stay for your pet?",
            
            'receptionist' => "🏨 **Hotel Management View**\n\n" .
                "**Availability:** {$availableRooms->count()}/{$totalRooms} rooms\n" .
                "**Occupancy Rate:** {$occupancyRate}%\n" .
                "**Current Boarders:** {$activeBoarders} pets\n\n" .
                "Ready to process check-ins or new reservations.",
            
            default => "🏨 Pet Hotel: {$availableRooms->count()} rooms available. Occupancy: {$occupancyRate}%",
        };
        
        return [
            'message' => $message,
            'confidence' => 1.0,
            'rich_content' => [
                'type' => 'hotel_summary',
                'stats' => [
                    'available_rooms' => $availableRooms->count(),
                    'total_rooms' => $totalRooms,
                    'occupancy_rate' => $occupancyRate,
                    'active_boarders' => $activeBoarders,
                ],
                'room_types' => $roomTypes->toArray(),
            ],
        ];
    }

    /**
     * Premium Services Response
     */
    private function premiumServicesResponse(string $role): array
    {
        $services = Service::where('is_active', true)->orderBy('category')->get();
        
        if ($services->isEmpty()) {
            return [
                'message' => "🐾 **Our Services**\n\nWe offer comprehensive pet care services including grooming, vaccination, consultations, and boarding. Please check our website or contact us for detailed information.",
                'confidence' => 0.8,
            ];
        }
        
        $servicesByCategory = $services->groupBy('category');
        
        $message = "🐾 **Our Premium Pet Services**\n\n";
        
        foreach ($servicesByCategory as $category => $categoryServices) {
            $message .= "**{$category}**\n";
            foreach ($categoryServices as $service) {
                $message .= "• {$service->name} - ₱" . number_format($service->price, 2);
                if ($service->description) {
                    $message .= "\n  _{$service->description}_";
                }
                $message .= "\n";
            }
            $message .= "\n";
        }
        
        return [
            'message' => $message,
            'confidence' => 1.0,
            'rich_content' => [
                'type' => 'service_catalog',
                'categories' => $servicesByCategory->map(fn($items) => $items->map(fn($s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'price' => $s->price,
                    'description' => $s->description,
                ]))->toArray(),
            ],
        ];
    }

    /**
     * Premium Inventory Response
     */
    private function premiumInventoryResponse(string $role, string $message): array
    {
        // Extract search term
        $searchTerm = preg_replace('/(do you have|is there|stock|available|inventory)/i', '', $message);
        $searchTerm = trim($searchTerm);
        
        $items = InventoryItem::where('status', 'active')
            ->where(function ($query) use ($searchTerm) {
                $query->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('sku', 'like', "%{$searchTerm}%")
                    ->orWhere('category', 'like', "%{$searchTerm}%");
            })
            ->limit(5)
            ->get();
        
        if ($items->isEmpty()) {
            return [
                'message' => "🔍 I couldn't find any products matching '{$searchTerm}'.\n\nWould you like to:\n• Browse all products\n• Search for something else\n• Check our service offerings",
                'confidence' => 0.9,
            ];
        }
        
        $response = "🔍 **Search Results for '{$searchTerm}'**\n\n";
        
        foreach ($items as $item) {
            $stockStatus = $item->stock > 10 ? '✅ In Stock' : ($item->stock > 0 ? '⚠️ Low Stock' : '❌ Out of Stock');
            $response .= "**{$item->name}**\n";
            $response .= "💰 ₱" . number_format($item->price, 2) . " | {$stockStatus} ({$item->stock} units)\n";
            if ($item->description) {
                $response .= "_{$item->description}_\n";
            }
            $response .= "\n";
        }
        
        return [
            'message' => $response,
            'confidence' => 0.95,
            'rich_content' => [
                'type' => 'inventory_search',
                'items' => $items->map(fn($i) => [
                    'id' => $i->id,
                    'name' => $i->name,
                    'sku' => $i->sku,
                    'price' => $i->price,
                    'stock' => $i->stock,
                    'category' => $i->category,
                ])->toArray(),
            ],
        ];
    }

    /**
     * Emergency Response
     */
    private function emergencyResponse(string $role): array
    {
        return [
            'message' => "🚨 **Emergency Support**\n\n" .
                "If this is a pet emergency:\n\n" .
                "1️⃣ **Call our 24/7 Hotline:** 📞 +63 (02) 8123-4567\n" .
                "2️⃣ **Emergency Vet:** Available 24/7\n" .
                "3️⃣ **Visit us immediately:** 123 Pet Care Ave\n\n" .
                "⚠️ **For life-threatening emergencies, please proceed directly to our facility or call now!**",
            'confidence' => 1.0,
            'actions' => [
                ['label' => '📞 Call Emergency Line', 'type' => 'tel', 'value' => '+630281234567'],
                ['label' => '📍 Get Directions', 'type' => 'link', 'value' => 'https://maps.google.com'],
            ],
        ];
    }

    /**
     * Operating Hours Response
     */
    private function operatingHoursResponse(string $role): array
    {
        return [
            'message' => "🕐 **Operating Hours**\n\n" .
                "**Monday - Friday:** 8:00 AM - 8:00 PM\n" .
                "**Saturday:** 9:00 AM - 6:00 PM\n" .
                "**Sunday:** 10:00 AM - 4:00 PM\n\n" .
                "🏥 **Emergency Services:** 24/7 Available\n\n" .
                "💡 _We recommend booking appointments in advance for non-emergency services._",
            'confidence' => 1.0,
        ];
    }

    /**
     * Location Response
     */
    private function locationResponse(string $role): array
    {
        return [
            'message' => "📍 **Find Us**\n\n" .
                "**Pawesome Pet Care Center**\n" .
                "123 Pet Care Avenue\n" .
                "Makati City, Metro Manila\n" .
                "Philippines 1200\n\n" .
                "🚗 **Parking:** Free customer parking available\n" .
                "🚌 **Public Transit:** Near Buendia MRT Station\n\n" .
                "📞 **Phone:** +63 (02) 8123-4567",
            'confidence' => 1.0,
            'actions' => [
                ['label' => '📍 View on Map', 'type' => 'link', 'value' => 'https://maps.google.com'],
            ],
        ];
    }

    /**
     * Contact Response
     */
    private function contactResponse(string $role): array
    {
        return [
            'message' => "📞 **Contact Us**\n\n" .
                "**Main Office:** +63 (02) 8123-4567\n" .
                "**Emergency Line:** +63 (02) 8987-6543 (24/7)\n" .
                "**Email:** hello@pawesome.ph\n" .
                "**Website:** www.pawesome.ph\n\n" .
                "**Social Media:**\n" .
                "📘 Facebook: @PawesomePH\n" .
                "📸 Instagram: @pawesome_pets\n\n" .
                "💬 _We're here to help! Response time is typically under 1 hour._",
            'confidence' => 1.0,
        ];
    }

    /**
     * Feedback Response
     */
    private function feedbackResponse(string $role): array
    {
        return [
            'message' => "📝 **We Value Your Feedback!**\n\n" .
                "Thank you for taking the time to share your thoughts. Your feedback helps us improve our services.\n\n" .
                "**How to submit feedback:**\n" .
                "• Reply with your comments here\n" .
                "• Email us at feedback@pawesome.ph\n" .
                "• Fill out the form on our website\n\n" .
                "⭐ **All feedback is reviewed by our management team within 24 hours.**",
            'confidence' => 1.0,
        ];
    }

    /**
     * Complaint Response
     */
    private function complaintResponse(string $role): array
    {
        return [
            'message' => "🙏 **We Apologize for Any Inconvenience**\n\n" .
                "Your satisfaction is our priority. Please share the details of your concern, and we will address it promptly.\n\n" .
                "**Escalation Options:**\n" .
                "1️⃣ **Chat with us:** Share details here\n" .
                "2️⃣ **Call Manager:** +63 (02) 8123-4568\n" .
                "3️⃣ **Email:** complaints@pawesome.ph\n\n" .
                "⚡ **We aim to resolve all issues within 24 hours.**",
            'confidence' => 1.0,
        ];
    }

    /**
     * Support Response
     */
    private function premiumSupportResponse(string $role): array
    {
        $roleSpecificHelp = match ($role) {
            'admin' => "**Admin Help Topics:**\n• User management\n• Reports and analytics\n• System configuration\n• Chatbot logs",
            'cashier' => "**Cashier Help Topics:**\n• Processing transactions\n• Handling refunds\n• Inventory lookup\n• End of day procedures",
            'receptionist' => "**Receptionist Help Topics:**\n• Booking appointments\n• Customer check-in/out\n• Hotel reservations\n• Customer inquiries",
            'veterinary' => "**Veterinary Help Topics:**\n• Accessing patient records\n• Appointment management\n• Medical history\n• Treatment plans",
            'customer' => "**Customer Help Topics:**\n• Booking services\n• Viewing pet history\n• Product availability\n• Pricing information",
            default => "**Available Help:**\n• Services and pricing\n• Operating hours\n• Contact information\n• General inquiries",
        };
        
        return [
            'message' => "❓ **Help Center**\n\n{$roleSpecificHelp}\n\n" .
                "**Quick Commands:**\n" .
                "• Type 'services' for service catalog\n" .
                "• Type 'pricing' for price list\n" .
                "• Type 'summary' for dashboard overview\n" .
                "• Type 'hours' for operating hours",
            'confidence' => 1.0,
        ];
    }

    /**
     * Navigation Response
     */
    private function premiumNavigationResponse(string $role): array
    {
        $paths = match ($role) {
            'admin' => [
                ['label' => '📊 Dashboard', 'path' => '/admin'],
                ['label' => '👥 Users', 'path' => '/admin/users'],
                ['label' => '📈 Reports', 'path' => '/admin/reports'],
                ['label' => '🤖 Chatbot Logs', 'path' => '/admin/chatbot'],
            ],
            'cashier' => [
                ['label' => '💵 POS', 'path' => '/cashier'],
                ['label' => '📦 Inventory', 'path' => '/cashier/inventory'],
                ['label' => '📜 Transactions', 'path' => '/cashier/transactions'],
            ],
            'receptionist' => [
                ['label' => '📅 Appointments', 'path' => '/receptionist/appointments'],
                ['label' => '🏨 Hotel', 'path' => '/receptionist/hotel'],
                ['label' => '👥 Customers', 'path' => '/receptionist/customers'],
            ],
            'veterinary' => [
                ['label' => '🏥 Medical Records', 'path' => '/veterinary/records'],
                ['label' => '📅 Appointments', 'path' => '/veterinary/appointments'],
                ['label' => '🐾 Patients', 'path' => '/veterinary/patients'],
            ],
            'customer' => [
                ['label' => '🐾 My Pets', 'path' => '/customer/pets'],
                ['label' => '📅 Bookings', 'path' => '/customer/bookings'],
                ['label' => '🏪 Store', 'path' => '/customer/store'],
            ],
            default => [
                ['label' => '🏠 Home', 'path' => '/'],
                ['label' => '🐾 Services', 'path' => '/services'],
                ['label' => '📞 Contact', 'path' => '/contact'],
            ],
        };
        
        return [
            'message' => "🧭 **Quick Navigation**\n\nHere are the main sections available to you:",
            'confidence' => 1.0,
            'actions' => $paths,
        ];
    }

    /**
     * Farewell Response
     */
    private function farewellResponse(string $role): array
    {
        $messages = [
            'admin' => "👋 Goodbye, Administrator! Have a productive day!",
            'manager' => "👋 Goodbye, Manager! See you tomorrow!",
            'cashier' => "👋 Take care! Have a great shift!",
            'receptionist' => "👋 Goodbye! Thanks for helping our customers!",
            'veterinary' => "👋 Goodbye, Doctor! Thank you for caring for our patients!",
            'customer' => "🐾 Thank you for visiting! We hope to see you and your pet soon!",
            'guest' => "🐾 Thank you for visiting Pawesome! Have a wonderful day!",
        ];
        
        return [
            'message' => $messages[$role] ?? $messages['guest'],
            'confidence' => 1.0,
        ];
    }

    /**
     * Gratitude Response
     */
    private function gratitudeResponse(string $role): array
    {
        return [
            'message' => "🙏 **You're Welcome!**\n\n" .
                "It's our pleasure to help! If you need anything else, just ask. We're always here for you and your pets! 🐾",
            'confidence' => 1.0,
        ];
    }

    /**
     * Premium Booking Response
     */
    private function premiumBookingResponse(string $role): array
    {
        $customerData = [];
        
        if ($role === 'customer' && auth()->check()) {
            $customer = Customer::where('email', auth()->user()->email)->first();
            if ($customer) {
                $pets = Pet::where('customer_id', $customer->id)->get();
                $customerData = [
                    'pets' => $pets->map(fn($p) => ['id' => $p->id, 'name' => $p->name, 'species' => $p->species]),
                ];
            }
        }
        
        $message = match ($role) {
            'customer' => "📅 **Let's Book an Appointment!**\n\n" .
                "Great! I can help you schedule a service for your pet.\n\n" .
                "**Next Steps:**\n" .
                "1️⃣ Select your pet\n" .
                "2️⃣ Choose a service\n" .
                "3️⃣ Pick a date and time\n\n" .
                "Would you like to see available services?",
            
            'receptionist' => "📅 **Booking Assistant**\n\n" .
                "Ready to create a new booking! Access the booking form or check availability first.",
            
            default => "📅 **Booking Services**\n\nPlease visit the appointments section or contact reception to schedule.",
        };
        
        return [
            'message' => $message,
            'confidence' => 1.0,
            'rich_content' => !empty($customerData) ? [
                'type' => 'booking_options',
                'data' => $customerData,
            ] : null,
            'actions' => [
                ['label' => '📅 Book Now', 'type' => 'workflow', 'workflow' => 'create_booking'],
                ['label' => '📋 View Services', 'path' => '/services'],
            ],
        ];
    }

    /**
     * Premium Pricing Response
     */
    private function premiumPricingResponse(string $role): array
    {
        $services = Service::where('is_active', true)->orderBy('price')->get();
        
        $message = "💰 **Our Service Pricing**\n\n";
        
        foreach ($services->groupBy('category') as $category => $items) {
            $message .= "**{$category}**\n";
            foreach ($items as $service) {
                $message .= "• {$service->name}: ₱" . number_format($service->price, 2) . "\n";
            }
            $message .= "\n";
        }
        
        $message .= "💡 **Note:** Prices may vary based on pet size and specific requirements.\n";
        $message .= "📞 Call us at +63 (02) 8123-4567 for detailed quotes.";
        
        return [
            'message' => $message,
            'confidence' => 1.0,
        ];
    }

    /**
     * Default Response
     */
    private function defaultResponse(string $role, string $message): array
    {
        // Try to provide a helpful response even when intent is unclear
        return [
            'message' => "🤔 I want to make sure I help you correctly!\n\n" .
                "Could you please clarify what you're looking for? For example:\n" .
                "• 'Show me services'\n" .
                "• 'What are your prices?'\n" .
                "• 'I need to book an appointment'\n" .
                "• 'Check availability for dog food'\n\n" .
                "Or type **'help'** for a list of things I can assist with!",
            'confidence' => 0.6,
            'suggestions' => [
                'Show services',
                'Pricing information',
                'Book appointment',
                'Operating hours',
            ],
        ];
    }

    // ============================================
    // Helper Methods
    // ============================================

    private function formatResponse(array $response, string $role, string $channel, string $intent): array
    {
        return [
            'reply' => $response['message'],
            'intent' => $intent,
            'role' => $role,
            'channel' => $channel,
            'suggestions' => $response['suggestions'] ?? $this->getDefaultSuggestions($role),
            'actions' => $response['actions'] ?? [],
            'rich_content' => $response['rich_content'] ?? null,
            'source' => $response['source'] ?? 'rule_based',
            'confidence' => $response['confidence'] ?? 0.8,
            'metadata' => [
                'timestamp' => now()->toIso8601String(),
                'processing_time_ms' => defined('LARAVEL_START') 
                    ? round((microtime(true) - LARAVEL_START) * 1000, 2)
                    : 0,
                'intent_detected' => $intent,
            ],
        ];
    }

    private function getWelcomeSuggestions(string $role): array
    {
        return match ($role) {
            'admin' => ['View summary', 'Check reports', 'View chatbot logs'],
            'manager' => ['View summary', 'Staff overview', 'Revenue report'],
            'cashier' => ['Start POS', 'Check inventory', 'View transactions'],
            'receptionist' => ['Today\'s appointments', 'Check-ins', 'Book appointment'],
            'veterinary' => ['Today\'s patients', 'Medical records', 'Appointments'],
            'customer' => ['Our services', 'Book appointment', 'View my pets', 'Store'],
            default => ['Services', 'Pricing', 'Contact us'],
        };
    }

    private function getSummarySuggestions(string $role): array
    {
        return match ($role) {
            'admin' => ['View detailed reports', 'Check low stock', 'User management'],
            'manager' => ['Staff schedule', 'Monthly report', 'Inventory status'],
            'cashier' => ['Process sale', 'End of day', 'Inventory check'],
            'receptionist' => ['New booking', 'Check-in guest', 'Customer lookup'],
            'veterinary' => ['Patient records', 'Schedule surgery', 'View lab results'],
            default => ['Book service', 'View store', 'Contact support'],
        };
    }

    private function getDefaultSuggestions(string $role): array
    {
        return match ($role) {
            'admin', 'manager' => ['Summary', 'Reports', 'Users', 'Help'],
            'cashier' => ['POS', 'Inventory', 'Transactions', 'Help'],
            'receptionist' => ['Appointments', 'Hotel', 'Customers', 'Help'],
            'veterinary' => ['Patients', 'Records', 'Appointments', 'Help'],
            'customer' => ['Services', 'Book', 'Store', 'Help'],
            default => ['Services', 'Pricing', 'Contact', 'Help'],
        };
    }

    private function getQuickActions(string $role): array
    {
        return match ($role) {
            'admin' => [
                ['label' => '📊 Dashboard', 'path' => '/admin'],
                ['label' => '📈 Reports', 'path' => '/admin/reports'],
            ],
            'cashier' => [
                ['label' => '💵 Open POS', 'path' => '/cashier'],
            ],
            'receptionist' => [
                ['label' => '📅 Appointments', 'path' => '/receptionist/appointments'],
            ],
            'veterinary' => [
                ['label' => '🏥 Records', 'path' => '/veterinary/records'],
            ],
            'customer' => [
                ['label' => '🐾 My Pets', 'path' => '/customer/pets'],
                ['label' => '📅 Book Now', 'path' => '/customer/bookings'],
            ],
            default => [],
        };
    }

    private function getWelcomeRichContent(string $role): ?array
    {
        return match ($role) {
            'admin', 'manager' => [
                'type' => 'stats_preview',
                'stats' => [
                    'today_appointments' => Appointment::whereDate('scheduled_at', today())->count(),
                    'active_users' => User::where('is_active', true)->count(),
                ],
            ],
            'customer' => [
                'type' => 'quick_links',
                'links' => [
                    ['label' => 'Book Grooming', 'icon' => '✂️'],
                    ['label' => 'Vaccination', 'icon' => '💉'],
                    ['label' => 'Pet Hotel', 'icon' => '🏨'],
                ],
            ],
            default => null,
        };
    }

    private function getRelatedSuggestions(string $category): array
    {
        return match ($category) {
            'services' => ['Book now', 'View pricing', 'All services'],
            'general' => ['Operating hours', 'Location', 'Contact'],
            'support' => ['Call us', 'Email support', 'FAQ'],
            default => ['Help', 'Contact us'],
        };
    }

    private function storeContext(?int $userId, string $intent, string $message): void
    {
        if ($userId) {
            $this->conversationContext[$userId] = [
                'last_intent' => $intent,
                'last_message' => $message,
                'timestamp' => now(),
            ];
        }
    }
}
