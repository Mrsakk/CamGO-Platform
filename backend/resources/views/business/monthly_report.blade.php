<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <title>របាយការណ៍ប្រចាំខែ / Monthly Performance Report - {{ $business->name_en }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Kantumruy+Pro:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        @media print {
            .no-print { display: none !important; }
            body { margin: 0; padding: 20px; }
        }
        body {
            font-family: 'Kantumruy Pro', 'Inter', sans-serif;
            background-color: #FAFAF9;
            color: #1C1917;
            margin: 0;
            padding: 40px 20px;
            line-height: 1.8;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border: 1px solid #E7E5E4;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #D4A017;
            padding-bottom: 24px;
            margin-bottom: 30px;
        }
        .brand {
            font-size: 20px;
            font-weight: 700;
            color: #D4A017;
        }
        .badge {
            display: inline-block;
            background: #FEF3C7;
            color: #92400E;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: #F5F5F4;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #D4A017;
        }
        .card-num {
            font-size: 32px;
            font-weight: 700;
            color: #0F766E;
            margin-top: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            text-align: left;
            padding: 12px 16px;
            border-bottom: 1px solid #E7E5E4;
        }
        th {
            background-color: #F5F5F4;
            font-weight: 600;
        }
        .print-btn {
            background-color: #D4A017;
            color: #FFFFFF;
            border: none;
            padding: 10px 24px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 13px;
            color: #78716C;
            border-top: 1px solid #E7E5E4;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
            <button class="print-btn" onclick="window.print()">🖨️ បោះពុម្ព ឬ រក្សាទុកជា PDF (Print / Save as PDF)</button>
        </div>

        <div class="header">
            <div>
                <div class="brand">🇰🇭 CamGO ទេសចរណ៍ | CamGO Business</div>
                <h1 style="margin: 8px 0 4px 0; font-size: 24px; color: #1C1917;">{{ $business->name_km }}</h1>
                <div style="font-size: 16px; color: #57534E;">{{ $business->name_en }}</div>
            </div>
            <div style="text-align: right;">
                <span class="badge">ខែ / Month: {{ $month }}</span>
                <div style="font-size: 12px; color: #78716C; margin-top: 8px;">{{ $startDate }} ដល់ {{ $endDate }}</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <div style="font-size: 14px; color: #57534E;">ចំនួនអ្នកចូលមើលប្រវត្តិរូប (Profile Views)</div>
                <div class="card-num">{{ number_format($views) }}</div>
            </div>
            <div class="card">
                <div style="font-size: 14px; color: #57534E;">ចំនួនភ្ញៀវទេសចរទាក់ទងផ្ទាល់ (Direct Inquiries)</div>
                <div class="card-num">{{ number_format($totalContacts) }}</div>
            </div>
        </div>

        <h3 style="margin-bottom: 10px; font-size: 18px;">ការទាក់ទងតាមបណ្តាញនីមួយៗ (Contacts by Channel)</h3>
        <table>
            <thead>
                <tr>
                    <th>បណ្តាញទំនាក់ទំនង (Channel)</th>
                    <th style="text-align: right;">ចំនួនលើក (Inquiry Count)</th>
                </tr>
            </thead>
            <tbody>
                @forelse($contactsByChannel as $channel => $count)
                    <tr>
                        <td style="text-transform: capitalize; font-weight: 600;">
                            @switch($channel)
                                @case('phone') 📞 ទូរស័ព្ទ (Phone Call) @break
                                @case('telegram') ✈️ តេឡេក្រាម (Telegram) @break
                                @case('whatsapp') 💬 វ័តស៍អាប់ (WhatsApp) @break
                                @case('messenger') 💌 ហ្វេសប៊ុកមេសសិនជ័រ (Messenger) @break
                                @case('email') ✉️ អ៊ីមែល (Email) @break
                                @case('directions') 🗺️ មើលផ្លូវ (Directions / Map) @break
                                @case('website') 🌐 គេហទំព័រ (Website) @break
                                @default {{ ucfirst($channel) }}
                            @endswitch
                        </td>
                        <td style="text-align: right; font-weight: 700; color: #0F766E;">{{ number_format($count) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="2" style="text-align: center; color: #78716C;">មិនទាន់មានទិន្នន័យទាក់ទងក្នុងខែនេះនៅឡើយទេ</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            របាយការណ៍នេះបង្កើតឡើងដោយស្វ័យប្រវត្តិតាមរយៈប្រព័ន្ធ CamGO Tourism Directory |
            ព័ត៌មានលម្អិតទំនាក់ទំនង៖ support@camgo.com
        </div>
    </div>
</body>
</html>
