<?php

namespace Database\Seeders;

use App\Models\ChatbotFaq;
use Illuminate\Database\Seeder;

class ChatbotFaqSeeder extends Seeder
{
    /**
     * Run the database seeds with predefined FAQ entries for the chatbot.
     */
    public function run(): void
    {
        $faqs = [
            // General FAQs
            [
                'question' => 'What are your business hours?',
                'answer' => 'We are open Monday to Saturday from 8:00 AM to 6:00 PM. On Sundays, we are open from 9:00 AM to 4:00 PM for boarding pick-up/drop-off only.',
                'keywords' => ['hours', 'open', 'time', 'schedule', 'when'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'question' => 'What is your contact information?',
                'answer' => 'You can reach us at:\n📞 Phone: (555) 123-4567\n📧 Email: info@pawsitive.com\n🏢 Address: 123 Pet Care Lane, Animal City, AC 12345',
                'keywords' => ['contact', 'phone', 'email', 'address', 'reach'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'question' => 'Do you offer emergency services?',
                'answer' => 'Yes, we offer 24/7 emergency veterinary services for existing clients. Please call our emergency hotline at (555) 123-4567 and press 1 for emergencies.',
                'keywords' => ['emergency', 'urgent', '24/7', 'after hours', 'critical'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'question' => 'What payment methods do you accept?',
                'answer' => 'We accept the following payment methods:\n💳 Credit/Debit cards (Visa, Mastercard, Amex)\n💵 Cash\n🏦 Bank transfer\n📱 GCash and PayMaya\nAll services must be paid in full before checkout.',
                'keywords' => ['payment', 'pay', 'cash', 'card', 'gcash'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 4,
            ],

            // Pet Hotel FAQs
            [
                'question' => 'How much does pet boarding cost?',
                'answer' => 'Our pet hotel rates vary by room type:\n\n🏠 Standard Room: ₱800/night\n🏡 Deluxe Room: ₱1,200/night\n🏰 Suite Room: ₱1,800/night\n\nAll stays include daily feeding, basic grooming, and playtime. Discounts available for stays longer than 7 days.',
                'keywords' => ['price', 'cost', 'rate', 'boarding', 'hotel', 'stay', 'how much'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'question' => 'What do I need to bring for pet boarding?',
                'answer' => 'Please bring:\n✅ Vaccination records (must be up-to-date)\n✅ Your pet\'s regular food (or we can provide for ₱150/day)\n✅ Any required medications with instructions\n✅ A familiar toy or blanket (optional)\n\nWe provide bedding, bowls, and treats. Please do not bring expensive items.',
                'keywords' => ['bring', 'what to bring', 'requirements', 'vaccination', 'documents'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'question' => 'Can I check on my pet during their stay?',
                'answer' => 'Absolutely! You can:\n📱 Message us anytime via Telegram for updates\n📸 Request photos of your pet\n📞 Call us during business hours\n💬 Use our chatbot for quick status updates\n\nWe also send daily update messages for stays longer than 3 days.',
                'keywords' => ['check', 'update', 'photo', 'status', 'how is my pet'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 12,
            ],
            [
                'question' => 'What is your cancellation policy for boarding?',
                'answer' => 'Our cancellation policy:\n\n✅ 48+ hours before check-in: Full refund\n⚠️ 24-48 hours: 50% refund\n❌ Less than 24 hours: No refund\n\nYou can reschedule without penalty up to 24 hours before your booking.',
                'keywords' => ['cancel', 'cancellation', 'refund', 'policy', 'reschedule'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 13,
            ],

            // Service FAQs
            [
                'question' => 'What services do you offer?',
                'answer' => 'We offer a comprehensive range of pet services:\n\n🏨 Pet Hotel & Boarding\n🐕 Dog Grooming (bath, haircut, nail trim)\n🐱 Cat Grooming\n💉 Veterinary Services\n🦴 Pet Training\n🛍️ Pet Supplies Store\n\nBook any service through our website or Telegram bot!',
                'keywords' => ['services', 'what do you do', 'offerings', 'available'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 20,
            ],
            [
                'question' => 'Do I need to book an appointment?',
                'answer' => 'Yes, appointments are required for:\n✂️ Grooming services\n🩺 Veterinary consultations\n📚 Training sessions\n\nPet hotel/boarding reservations should be made at least 24 hours in advance when possible.\n\nYou can book through:\n🌐 Our website\n🤖 Telegram bot\n📞 Phone call during business hours',
                'keywords' => ['appointment', 'book', 'schedule', 'reservation', 'how to book'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 21,
            ],
            [
                'question' => 'How long does grooming take?',
                'answer' => 'Typical grooming times:\n\n🐕 Small dogs: 1-2 hours\n🐕 Medium dogs: 2-3 hours\n🐕 Large dogs: 3-4 hours\n🐱 Cats: 1.5-2 hours\n\nWe\'ll notify you via Telegram when your pet is ready for pickup!',
                'keywords' => ['grooming time', 'how long', 'duration', 'groom'],
                'scope' => 'general',
                'is_active' => true,
                'sort_order' => 22,
            ],

            // Customer-specific FAQs
            [
                'question' => 'How do I book a hotel stay?',
                'answer' => 'To book a pet hotel stay:\n\n1. Go to the Pet Hotel page on your dashboard\n2. Select your dates and preferred room type\n3. Choose your pet\n4. Complete the booking form\n5. Wait for confirmation\n\nOr simply ask me to help you navigate there!',
                'keywords' => ['book hotel', 'book boarding', 'reserve room', 'how to book'],
                'scope' => 'customer',
                'is_active' => true,
                'sort_order' => 30,
            ],
            [
                'question' => 'How can I get Telegram notifications?',
                'answer' => 'To receive Telegram notifications:\n\n1. Go to your Profile page\n2. Click "Link Telegram Account"\n3. Open Telegram and search for @PawsitiveBot\n4. Click Start in the bot\n5. Return to your profile and confirm the link\n\nYou\'ll then receive instant notifications about your bookings, appointments, and reminders!',
                'keywords' => ['telegram', 'notifications', 'link', 'bot', 'setup'],
                'scope' => 'customer',
                'is_active' => true,
                'sort_order' => 31,
            ],
            [
                'question' => 'How do I view my upcoming appointments?',
                'answer' => 'You can view your appointments:\n\n🌐 On the Customer Dashboard under "My Appointments"\n🤖 By asking me "What are my appointments?"\n📱 Via Telegram bot using /appointments\n\nYou\'ll see all scheduled, confirmed, and past appointments with details.',
                'keywords' => ['appointments', 'view', 'upcoming', 'my bookings', 'schedule'],
                'scope' => 'customer',
                'is_active' => true,
                'sort_order' => 32,
            ],

            // Staff-specific FAQs
            [
                'question' => 'How do I check in a boarding guest?',
                'answer' => 'To check in a boarding guest:\n\n1. Go to Receptionist → Hotel Bookings\n2. Find the reservation\n3. Click "Check In"\n4. Verify vaccination records\n5. Collect any special instructions\n6. Assign room if not pre-assigned\n7. Confirm check-in\n\nThe customer will receive a notification automatically.',
                'keywords' => ['check in', 'checkin', 'boarding checkin', 'how to check in'],
                'scope' => 'receptionist',
                'is_active' => true,
                'sort_order' => 40,
            ],
            [
                'question' => 'How do I approve an appointment?',
                'answer' => 'To approve a pending appointment:\n\n1. Go to Receptionist → Appointments\n2. Find the pending appointment\n3. Review the details\n4. Assign a veterinarian if needed\n5. Click "Approve"\n6. Confirm the action\n\nThe customer will receive an automatic confirmation notification.',
                'keywords' => ['approve', 'approval', 'confirm appointment', 'pending'],
                'scope' => 'receptionist',
                'is_active' => true,
                'sort_order' => 41,
            ],

            // Admin/Manager FAQs
            [
                'question' => 'How do I add a new staff member?',
                'answer' => 'To add a new staff member:\n\n1. Go to Admin → Users\n2. Click "Add User"\n3. Fill in the user details\n4. Select the appropriate role (receptionist, veterinary, etc.)\n5. Set a temporary password\n6. Save the user\n\nThe staff member will receive an email to set their password.',
                'keywords' => ['add user', 'new staff', 'create user', 'employee'],
                'scope' => 'admin',
                'is_active' => true,
                'sort_order' => 50,
            ],
            [
                'question' => 'How do I manage chatbot FAQs?',
                'answer' => 'To manage chatbot FAQs:\n\n1. Go to Admin → Chatbot Logs\n2. Click the "FAQs" tab\n3. Add, edit, or delete FAQ entries\n4. Set scope (general, customer, receptionist, etc.) to control visibility\n5. Add keywords for better matching\n6. Set sort order for priority\n\nChanges take effect immediately!',
                'keywords' => ['faq', 'chatbot faq', 'manage faq', 'edit faq'],
                'scope' => 'admin',
                'is_active' => true,
                'sort_order' => 51,
            ],
        ];

        foreach ($faqs as $faq) {
            ChatbotFaq::firstOrCreate(
                ['question' => $faq['question']],
                $faq
            );
        }
    }
}
