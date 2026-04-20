<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Boarding;
use App\Models\Customer;

/**
 * Service for generating formatted notification messages
 * Supports multiple channels: in-app, Telegram, email
 */
class NotificationTemplateService
{
    /**
     * Template types for booking/reservation notifications
     */
    const TYPE_BOOKING_CREATED = 'booking_created';
    const TYPE_BOOKING_CONFIRMED = 'booking_confirmed';
    const TYPE_BOOKING_CHECKED_IN = 'booking_checked_in';
    const TYPE_BOOKING_CHECKED_OUT = 'booking_checked_out';
    const TYPE_BOOKING_CANCELLED = 'booking_cancelled';
    const TYPE_BOOKING_REMINDER = 'booking_reminder';
    const TYPE_APPOINTMENT_CREATED = 'appointment_created';
    const TYPE_APPOINTMENT_CONFIRMED = 'appointment_confirmed';
    const TYPE_APPOINTMENT_COMPLETED = 'appointment_completed';
    const TYPE_APPOINTMENT_CANCELLED = 'appointment_cancelled';
    const TYPE_APPOINTMENT_REMINDER = 'appointment_reminder';

    /**
     * Generate a notification message based on template type
     */
    public static function generate(string $type, array $data, string $channel = 'telegram'): string
    {
        return match ($channel) {
            'telegram' => self::forTelegram($type, $data),
            'app' => self::forApp($type, $data),
            'email' => self::forEmail($type, $data),
            default => self::forTelegram($type, $data),
        };
    }

    /**
     * Telegram-formatted messages with emojis
     */
    private static function forTelegram(string $type, array $data): string
    {
        return match ($type) {
            self::TYPE_BOOKING_CREATED => "🏨 *Booking Created*\n\n" .
                "Your pet hotel reservation has been received.\n\n" .
                "📅 Check-in: {$data['check_in']}\n" .
                "📅 Check-out: {$data['check_out']}\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "🏠 Room Type: {$data['room_type']}\n" .
                "⏳ Status: *Pending Confirmation*\n\n" .
                "We'll notify you once confirmed!",

            self::TYPE_BOOKING_CONFIRMED => "✅ *Booking Confirmed!*\n\n" .
                "Your reservation is now confirmed.\n\n" .
                "📅 Check-in: {$data['check_in']}\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "🏠 Room: {$data['room_number']}\n\n" .
                "See you soon! 🐕",

            self::TYPE_BOOKING_CHECKED_IN => "🎉 *Pet Checked In*\n\n" .
                "{$data['pet_name']} has been checked in safely!\n\n" .
                "🏠 Room: {$data['room_number']}\n" .
                "📅 Check-out: {$data['check_out']}\n\n" .
                "Your pet is in good hands. We'll take great care! 💕",

            self::TYPE_BOOKING_CHECKED_OUT => "👋 *Check Out Complete*\n\n" .
                "{$data['pet_name']} has been checked out.\n\n" .
                "📅 Stay duration: {$data['nights']} nights\n" .
                "💰 Total: {$data['total']}\n\n" .
                "Thank you for choosing us! We hope to see you again! 🐾",

            self::TYPE_BOOKING_CANCELLED => "❌ *Booking Cancelled*\n\n" .
                "Your reservation has been cancelled.\n\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "📅 Was scheduled: {$data['check_in']}\n\n" .
                "If this was a mistake, please contact us immediately.",

            self::TYPE_BOOKING_REMINDER => "⏰ *Reminder: Upcoming Check-in*\n\n" .
                "Your pet's check-in is coming up!\n\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "📅 Check-in: {$data['check_in']}\n" .
                "🏠 Room Type: {$data['room_type']}\n\n" .
                "Don't forget to bring vaccination records! 📋",

            self::TYPE_APPOINTMENT_CREATED => "📅 *Appointment Scheduled*\n\n" .
                "Your appointment has been received.\n\n" .
                "🩺 Service: {$data['service']}\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "📅 Date: {$data['date']}\n" .
                "⏰ Time: {$data['time']}\n" .
                "⏳ Status: *Pending Confirmation*\n\n" .
                "We'll confirm shortly!",

            self::TYPE_APPOINTMENT_CONFIRMED => "✅ *Appointment Confirmed!*\n\n" .
                "Your appointment is confirmed.\n\n" .
                "🩺 Service: {$data['service']}\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "👨‍⚕️ Veterinarian: {$data['veterinarian']}\n" .
                "📅 Date: {$data['date']}\n" .
                "⏰ Time: {$data['time']}\n\n" .
                "Please arrive 10 minutes early!",

            self::TYPE_APPOINTMENT_COMPLETED => "🎉 *Appointment Completed*\n\n" .
                "Thank you for visiting!\n\n" .
                "🩺 Service: {$data['service']}\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "👨‍⚕️ Seen by: {$data['veterinarian']}\n\n" .
                "Your pet's health record has been updated. 📋",

            self::TYPE_APPOINTMENT_CANCELLED => "❌ *Appointment Cancelled*\n\n" .
                "Your appointment has been cancelled.\n\n" .
                "🩺 Service: {$data['service']}\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "📅 Was scheduled: {$data['date']}\n\n" .
                "Need to reschedule? Contact us or book online!",

            self::TYPE_APPOINTMENT_REMINDER => "⏰ *Appointment Reminder*\n\n" .
                "You have an appointment coming up!\n\n" .
                "🩺 Service: {$data['service']}\n" .
                "🐾 Pet: {$data['pet_name']}\n" .
                "📅 Date: {$data['date']}\n" .
                "⏰ Time: {$data['time']}\n\n" .
                "See you soon! 🐕",

            default => "🔔 Notification: " . ($data['message'] ?? 'New update available'),
        };
    }

    /**
     * In-app notification messages (shorter, cleaner)
     */
    private static function forApp(string $type, array $data): string
    {
        return match ($type) {
            self::TYPE_BOOKING_CREATED => "Hotel booking created for {$data['pet_name']}. Pending confirmation.",
            self::TYPE_BOOKING_CONFIRMED => "Booking confirmed! {$data['pet_name']} is set for {$data['check_in']}.",
            self::TYPE_BOOKING_CHECKED_IN => "{$data['pet_name']} checked in to Room {$data['room_number']}.",
            self::TYPE_BOOKING_CHECKED_OUT => "{$data['pet_name']} checked out. Thanks for staying with us!",
            self::TYPE_BOOKING_CANCELLED => "Booking for {$data['pet_name']} has been cancelled.",
            self::TYPE_BOOKING_REMINDER => "Reminder: {$data['pet_name']}'s check-in is tomorrow!",
            self::TYPE_APPOINTMENT_CREATED => "Appointment scheduled for {$data['pet_name']}. Pending confirmation.",
            self::TYPE_APPOINTMENT_CONFIRMED => "Appointment confirmed for {$data['pet_name']} on {$data['date']}.",
            self::TYPE_APPOINTMENT_COMPLETED => "{$data['pet_name']}'s appointment completed. Records updated.",
            self::TYPE_APPOINTMENT_CANCELLED => "Appointment for {$data['pet_name']} cancelled.",
            self::TYPE_APPOINTMENT_REMINDER => "Reminder: {$data['pet_name']}'s appointment is tomorrow at {$data['time']}.",
            default => $data['message'] ?? 'New notification',
        };
    }

    /**
     * Email-formatted messages (HTML ready)
     */
    private static function forEmail(string $type, array $data): string
    {
        return match ($type) {
            default => self::forTelegram($type, $data),
        };
    }

    /**
     * Generate booking notification data from Boarding model
     */
    public static function fromBoarding(Boarding $boarding, string $type): array
    {
        return [
            'pet_name' => $boarding->pet?->name ?? 'Your pet',
            'customer_name' => $boarding->customer?->name ?? 'Valued customer',
            'check_in' => $boarding->check_in?->format('M d, Y') ?? 'TBD',
            'check_out' => $boarding->check_out?->format('M d, Y') ?? 'TBD',
            'room_type' => $boarding->room?->type ?? 'Standard',
            'room_number' => $boarding->room?->room_number ?? 'TBD',
            'nights' => $boarding->check_in && $boarding->check_out
                ? $boarding->check_in->diffInDays($boarding->check_out)
                : 0,
            'total' => '₱' . number_format($boarding->total_cost ?? 0, 2),
            'booking_id' => $boarding->id,
        ];
    }

    /**
     * Generate appointment notification data from Appointment model
     */
    public static function fromAppointment(Appointment $appointment, string $type): array
    {
        return [
            'pet_name' => $appointment->pet?->name ?? 'Your pet',
            'customer_name' => $appointment->customer?->name ?? 'Valued customer',
            'service' => $appointment->service?->name ?? 'Service',
            'veterinarian' => $appointment->veterinarian?->name ?? 'Veterinarian',
            'date' => $appointment->scheduled_at?->format('M d, Y') ?? 'TBD',
            'time' => $appointment->scheduled_at?->format('g:i A') ?? 'TBD',
            'appointment_id' => $appointment->id,
        ];
    }
}
