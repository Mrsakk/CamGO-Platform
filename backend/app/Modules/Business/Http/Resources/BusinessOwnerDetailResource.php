<?php

namespace App\Modules\Business\Http\Resources;

use Illuminate\Http\Request;

class BusinessOwnerDetailResource extends BusinessAdminDetailResource
{
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        unset(
            $data['owner_name'],
            $data['owner_phone'],
            $data['internal_notes'],
            $data['owner_accounts'],
            $data['verified_by'],
            $data['verifier_name'],
        );

        return $data;
    }
}
