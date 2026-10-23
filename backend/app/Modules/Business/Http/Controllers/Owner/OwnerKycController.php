<?php

namespace App\Modules\Business\Http\Controllers\Owner;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\BusinessDocumentResource;
use App\Modules\Business\Models\Business;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OwnerKycController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $business = $this->ownerBusiness($request);
        if (! $business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $this->authorize('view', $business);

        $documents = $business->documents()->with('uploader')->get();

        return $this->successResponse(
            BusinessDocumentResource::collection($documents),
            'KYC documents retrieved successfully'
        );
    }

    public function upload(Request $request): JsonResponse
    {
        $business = $this->ownerBusiness($request);
        if (! $business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $this->authorize('update', $business);

        $validated = $request->validate([
            'document' => 'required|file|mimes:pdf,jpeg,png,jpg|max:10240',
            'type' => 'required|string|in:id_card,business_license,other',
            'expires_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $file = $validated['document'];
        $path = $file->store("business/documents/{$business->id}", 'local');

        $document = $business->documents()->create([
            'type' => $validated['type'],
            'path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
            'expires_at' => $validated['expires_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLog::record('business_kyc_uploaded_by_owner', $business, null, [
            'document_id' => $document->id,
            'type' => $document->type,
            'file_name' => $document->file_name,
            'owner_id' => $request->user()->id,
        ]);

        return $this->successResponse(
            new BusinessDocumentResource($document->load('uploader')),
            'KYC document uploaded securely. Staff will review it for verification.',
            201
        );
    }

    public function download(Request $request, int $documentId): BinaryFileResponse|JsonResponse
    {
        $business = $this->ownerBusiness($request);
        if (! $business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $this->authorize('view', $business);

        $document = $business->documents()->findOrFail($documentId);
        $disk = Storage::disk('local');

        if (! $disk->exists($document->path)) {
            return $this->errorResponse('Document file not found in storage.', 404);
        }

        AuditLog::record('business_kyc_downloaded_by_owner', $business, null, [
            'document_id' => $document->id,
            'file_name' => $document->file_name,
            'owner_id' => $request->user()->id,
        ]);

        return response()->download(
            $disk->path($document->path),
            $document->file_name,
            ['Content-Type' => $document->mime_type ?: 'application/octet-stream']
        );
    }

    public function destroy(Request $request, int $documentId): JsonResponse
    {
        $business = $this->ownerBusiness($request);
        if (! $business) {
            return $this->errorResponse('No business is linked to this account.', 404);
        }

        $this->authorize('update', $business);

        $document = $business->documents()->findOrFail($documentId);

        if ((int) $document->uploaded_by !== (int) $request->user()->id) {
            return $this->errorResponse(
                'Only documents uploaded by your account can be removed.',
                403
            );
        }

        $disk = Storage::disk('local');
        if ($disk->exists($document->path)) {
            $disk->delete($document->path);
        }

        $document->delete();

        AuditLog::record('business_kyc_deleted_by_owner', $business, [
            'document_id' => $documentId,
            'file_name' => $document->file_name,
        ]);

        return $this->successResponse(null, 'KYC document removed successfully');
    }

    private function ownerBusiness(Request $request): ?Business
    {
        $businessId = $request->user()?->business_id;

        return $businessId ? Business::find($businessId) : null;
    }
}
