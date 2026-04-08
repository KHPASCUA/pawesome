<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Services list']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Service created']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Service updated']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Service deleted']);
    }
}
