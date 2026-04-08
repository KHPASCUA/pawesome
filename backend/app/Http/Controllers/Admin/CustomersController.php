<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CustomersController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Customers list']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Customer updated']);
    }
}
