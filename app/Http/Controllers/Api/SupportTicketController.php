<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SupportTicketController extends Controller
{
    /**
     * For Owner: List their own tickets.
     */
    public function index(Request $request)
    {
        $tickets = SupportTicket::where('user_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json(['status' => 'success', 'data' => $tickets]);
    }

    /**
     * For Owner: Create a new ticket.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:bug,suggestion,complaint',
            'attachment' => 'nullable|image|max:2048'
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('support-attachments', 'public');
        }

        $ticket = SupportTicket::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'attachment_path' => $path,
            'status' => 'open',
            'is_read_by_admin' => false,
            'is_read_by_user' => true,
        ]);

        return response()->json(['status' => 'success', 'data' => $ticket]);
    }

    /**
     * For Superadmin: All tickets.
     */
    public function indexAll(Request $request)
    {
        if ($request->user()->role !== 'superadmin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tickets = SupportTicket::with('user:id,name,username')
            ->latest()
            ->get();

        // Mark all as read by admin when viewing the list
        SupportTicket::where('is_read_by_admin', false)->update(['is_read_by_admin' => true]);

        return response()->json(['status' => 'success', 'data' => $tickets]);
    }

    /**
     * Provide feedback or update status.
     */
    public function update(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);

        if ($request->user()->role === 'superadmin') {
            $request->validate([
                'status' => 'sometimes|in:open,in_progress,resolved,closed',
                'admin_feedback' => 'nullable|string'
            ]);

            $ticket->update($request->only(['status', 'admin_feedback']));
            $ticket->is_read_by_user = false;
            $ticket->is_read_by_admin = true;
            $ticket->save();

            return response()->json(['status' => 'success', 'data' => $ticket]);
        }
        
        // Owner only marks as read
        if ($request->user()->id === $ticket->user_id) {
            $ticket->is_read_by_user = true;
            $ticket->save();
            return response()->json(['status' => 'success']);
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    public function unreadCount(Request $request)
    {
        $role = $request->user()->role;
        $count = 0;

        if ($role === 'superadmin') {
            $count = SupportTicket::where('is_read_by_admin', false)->count();
        } else {
            $count = SupportTicket::where('user_id', $request->user()->id)
                ->where('is_read_by_user', false)
                ->count();
        }

        return response()->json(['status' => 'success', 'count' => $count]);
    }
}
