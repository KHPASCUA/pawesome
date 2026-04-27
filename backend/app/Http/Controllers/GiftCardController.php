<?php

namespace App\Http\Controllers;

use App\Models\GiftCard;
use Illuminate\Http\Request;

class GiftCardController extends Controller
{
    /**
     * Check gift card balance
     */
    public function checkBalance($number)
    {
        $giftCard = GiftCard::where('number', $number)
            ->active()
            ->first();

        if (!$giftCard) {
            return response()->json(['error' => 'Gift card not found or inactive'], 404);
        }

        if ($giftCard->isExpired()) {
            return response()->json(['error' => 'Gift card has expired'], 400);
        }

        return response()->json([
            'balance' => $giftCard->balance,
        ]);
    }
}
