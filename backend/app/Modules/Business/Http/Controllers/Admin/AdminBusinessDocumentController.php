<?php

namespace App\Modules\Business\Http\Controllers\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Models\AuditLog;
use App\Modules\Business\Http\Resources\BusinessDocumentResource;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminBusinessDocumentController extends ApiController
{
    public function index(int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('viewKyc', $business);

        $documents = $business->documents()->with('uploader')->get();
        return $this->successResponse(BusinessDocumentResource::collection($documents));
    }

    public function upload(Request $request, int $businessId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('verify', $business);

        $request->validate([
            'document' => 'required|file|mimes:pdf,jpeg,png,jpg|max:10240',
            'type' => 'required|string|in:id_card,business_license,other',
            'expires_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $file = $request->file('document');
        $originalName = $file->getClientOriginalName();
        $mime = $file->getMimeType();
        $size = $file->getSize();

        // Store securely on private 'local' disk
        $path = $file->store("business/documents/{$business->id}", 'local');

        $doc = $business->documents()->create([
            'type' => $request->input('type'),
            'path' => $path,
            'file_name' => $originalName,
            'file_size' => $size,
            'mime_type' => $mime,
            'uploaded_by' => Auth::id(),
            'expires_at' => $request->input('expires_at'),
            'notes' => $request->input('notes'),
        ]);

        AuditLog::record('business_kyc_uploaded', $business, null, [
            'document_id' => $doc->id,
            'type' => $doc->type,
            'file_name' => $doc->file_name,
        ]);

        return $this->successResponse(
            new BusinessDocumentResource($doc->load('uploader')),
            'KYC document uploaded securely to private vault',
            201
        );
    }

    /**
     * Download or view private KYC document.
     * Enforces business.kyc.view permission.
     */
    public function download(int $businessId, int $documentId): BinaryFileResponse|JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('viewKyc', $business);

        $document = $business->documents()->findOrFail($documentId);
        $disk = Storage::disk('local');

        if (!$disk->exists($document->path)) {
            return $this->errorResponse('Document file not found in storage.', 404);
        }

        AuditLog::record('business_kyc_downloaded', $business, null, [
            'document_id' => $document->id,
            'file_name' => $document->file_name,
        ]);

        return response()->download(
            $disk->path($document->path),
            $document->file_name,
            ['Content-Type' => $document->mime_type ?: 'application/octet-stream']
        );
    }

    public function destroy(int $businessId, int $documentId): JsonResponse
    {
        $business = Business::findOrFail($businessId);
        $this->authorize('verify', $business);

        $document = $business->documents()->findOrFail($documentId);

        $disk = Storage::disk('local');
        if ($disk->exists($document->path)) {
            $disk->delete($document->path);
        }

        $document->delete();

        AuditLog::record('business_kyc_deleted', $business, ['document_id' => $documentId]);

        return $this->successResponse(null, 'KYC document removed');
    }
}
