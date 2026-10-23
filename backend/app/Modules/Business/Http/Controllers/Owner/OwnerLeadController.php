<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Lead;
use App\Modules\Business\Services\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OwnerLeadController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->business($request);

        $validated = $request->validate([
            'status' => 'nullable|in:new,contacted,closed,spam,qualified,won,lost',
            'per_page' => 'nullable|integer|between:1,100',
        ]);

        $leads = Lead::forBusiness($business->id)
            ->withStatus($validated['status'] ?? null)
            ->with('assignee:id,name')
            ->orderByDesc('last_contact_at')
            ->paginate($validated['per_page'] ?? 20)
            ->through(fn (Lead $lead) => [
                'id' => $lead->id,
                'status' => $lead->status,
                'primary_channel' => $lead->primary_channel,
                'source' => $lead->source,
                'locale' => $lead->locale,
                'contact_count' => $lead->contact_count,
                'first_contact_at' => $lead->first_contact_at?->toIso8601String(),
                'last_contact_at' => $lead->last_contact_at?->toIso8601String(),
                'assigned_to' => $lead->assigned_to,
                'assignee_name' => $lead->assignee?->name,
                'note' => $lead->note,
            ]);

        return $this->paginateResponse($leads, 'Leads retrieved successfully');
    }

    public function stats(Request $request, LeadService $service): JsonResponse
    {
        $business = $this->business($request);

        $validated = $request->validate([
            'days' => 'nullable|integer|between:1,365',
        ]);

        $requestedDays = (int) ($validated['days'] ?? 30);
        $maxAnalyticsDays = $business->planLimit('analytics_days');
        $days = is_numeric($maxAnalyticsDays)
            ? min($requestedDays, (int) $maxAnalyticsDays)
            : $requestedDays;

        return $this->successResponse($service->stats($business, $days));
    }

    public function export(Request $request): StreamedResponse|JsonResponse
    {
        $business = $this->business($request);

        if (! $business->planLimit('lead_export', false)) {
            return $this->errorResponse(
                'Lead export is available on Pro and Premium plans.',
                403
            );
        }

        $validated = $request->validate([
            'status' => 'nullable|in:new,contacted,closed,spam,qualified,won,lost',
        ]);

        $leads = Lead::forBusiness($business->id)
            ->withStatus($validated['status'] ?? null)
            ->with('assignee:id,name')
            ->orderByDesc('last_contact_at')
            ->get();

        $sanitize = static function ($value) {
            if (! is_string($value) || $value === '') {
                return $value;
            }

            return preg_match('/^[=+\-@]/', $value) ? "'{$value}" : $value;
        };

        $filename = 'leads-' . ($business->slug ?: $business->id) . '-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($leads, $sanitize) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");

            fputcsv($out, [
                'Lead ID',
                'Status',
                'Channel',
                'Source',
                'Locale',
                'Contacts',
                'First contact',
                'Last contact',
                'Assigned to',
                'Note',
            ]);

            foreach ($leads as $lead) {
                fputcsv($out, [
                    $lead->id,
                    $lead->status,
                    $sanitize($lead->primary_channel),
                    $sanitize($lead->source),
                    $sanitize($lead->locale),
                    $lead->contact_count,
                    $lead->first_contact_at?->toIso8601String(),
                    $lead->last_contact_at?->toIso8601String(),
                    $sanitize($lead->assignee?->name),
                    $sanitize($lead->note),
                ]);
            }

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function update(Request $request, int $leadId, LeadService $service): JsonResponse
    {
        $business = $this->business($request);
        $lead = Lead::forBusiness($business->id)->findOrFail($leadId);

        $validated = $request->validate([
            'status' => 'required|in:new,contacted,closed,spam,qualified,won,lost',
            'note' => 'nullable|string|max:2000',
            'assigned_to' => 'nullable|integer|exists:users,id',
        ]);

        if (!empty($validated['assigned_to'])) {
            $isMember = $business->members()
                ->where('user_id', $validated['assigned_to'])
                ->where('status', 'active')
                ->exists();

            if (!$isMember) {
                return $this->errorResponse('The selected assignee is not an active team member.', 422);
            }
        }

        $lead = $service->updateStatus(
            $lead,
            $validated['status'],
            $validated['note'] ?? null,
            $validated['assigned_to'] ?? null,
        );

        return $this->successResponse($lead->fresh('assignee:id,name'), 'Lead updated successfully');
    }

    public function addNote(Request $request, int $leadId): JsonResponse
    {
        $business = $this->business($request);
        $lead = Lead::forBusiness($business->id)->findOrFail($leadId);

        $validated = $request->validate([
            'note' => 'required|string|min:2|max:2000',
        ]);

        $note = $lead->notes()->create([
            'user_id' => $request->user()->id,
            'note' => $validated['note'],
        ]);

        return $this->successResponse($note, 'Lead note added successfully', 201);
    }

    private function business(Request $request): Business
    {
        $user = $request->user();

        if (empty($user->business_id)) {
            abort(404, 'No business is linked to this account.');
        }

        $business = Business::findOrFail($user->business_id);
        $this->authorize('viewStats', $business);

        return $business;
    }
}
