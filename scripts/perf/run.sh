#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Running CamGO Performance Benchmark     "
echo "=========================================="

cd "$(dirname "$0")/../.."

echo "1. Benchmarking Backend API Endpoints..."
php scripts/perf/benchmark.php

echo "2. Measuring Frontend Bundle Sizes..."
cd frontend-travel && npm run build --silent
cd ../frontend-business && npm run build --silent

echo "3. Diagnostics..."
cd ../backend && php artisan perf:report --limit=10

echo "Performance benchmark completed."
