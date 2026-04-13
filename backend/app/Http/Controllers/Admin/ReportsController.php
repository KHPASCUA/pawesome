<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function summary()
    {
        return response()->json(['message' => 'Reports summary']);
    }
}
