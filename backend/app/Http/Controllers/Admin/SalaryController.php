<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SalaryController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => User::where('role', '!=', 'customer')
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => $this->formatEmployee($user)),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employeeId' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'baseSalary' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:50',
        ]);

        $email = Str::slug($data['name']) . '-' . Str::lower(Str::random(6)) . '@pawesome.local';

        $user = User::create([
            'name' => $data['name'],
            'email' => $email,
            'password' => Hash::make(Str::random(16)),
            'role' => 'staff',
            'is_active' => ($data['status'] ?? 'active') === 'active',
            'department' => $data['department'] ?? null,
            'position' => $data['position'] ?? null,
            'base_salary' => $data['baseSalary'] ?? 0,
            'employment_status' => $data['status'] ?? 'active',
        ]);

        return response()->json(['data' => $this->formatEmployee($user)], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'department' => 'nullable|string|max:100',
            'position' => 'nullable|string|max:100',
            'baseSalary' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|max:50',
        ]);

        $user->update([
            'name' => $data['name'] ?? $user->name,
            'department' => $data['department'] ?? $user->department,
            'position' => $data['position'] ?? $user->position,
            'base_salary' => $data['baseSalary'] ?? $user->base_salary,
            'employment_status' => $data['status'] ?? $user->employment_status,
            'is_active' => isset($data['status']) ? $data['status'] === 'active' : $user->is_active,
        ]);

        return response()->json(['data' => $this->formatEmployee($user->fresh())]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'Salary record deleted']);
    }

    private function formatEmployee(User $user): array
    {
        return [
            'id' => $user->id,
            'employeeId' => 'EMP-' . str_pad((string) $user->id, 3, '0', STR_PAD_LEFT),
            'name' => $user->name,
            'department' => $user->department ?? ucfirst($user->role),
            'position' => $user->position ?? 'Staff',
            'baseSalary' => (float) ($user->base_salary ?? 0),
            'housingAllowance' => 0,
            'transportAllowance' => 0,
            'medicalAllowance' => 0,
            'performanceBonus' => 0,
            'status' => $user->employment_status ?? ($user->is_active ? 'active' : 'inactive'),
        ];
    }
}
