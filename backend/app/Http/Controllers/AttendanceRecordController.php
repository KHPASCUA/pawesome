<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use Illuminate\Http\Request;

class AttendanceRecordController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => AttendanceRecord::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'staff_id' => 'required|string|max:50',
            'name' => 'required|string|max:100',
            'date' => 'required|date',
            'status' => 'required|in:Present,Absent,Late',
            'method' => 'required|in:Manual,Biometric'
        ]);

        $attendance = AttendanceRecord::create($validated);

        return response()->json([
            'success' => true,
            'data' => $attendance
        ]);
    }

    public function summary()
    {
        $summary = AttendanceRecord::selectRaw('
            date,
            SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN status = "Absent" THEN 1 ELSE 0 END) as absent,
            SUM(CASE WHEN status = "Late" THEN 1 ELSE 0 END) as late
        ')
        ->groupBy('date')
        ->orderBy('date', 'desc')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }
}
