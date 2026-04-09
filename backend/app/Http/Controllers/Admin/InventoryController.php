<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Inventory list']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Item created']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Item updated']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Item deleted']);
    }
}
