# Food Diary API - Demo Script
# Демонстрация работы всех эндпоинтов

Write-Host "=== Food Diary API Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1. Health Check" -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET | ConvertFrom-Json
Write-Host "Status: $($health.status)" -ForegroundColor Green
Write-Host ""

# 2. Register new user
Write-Host "2. Register new user" -ForegroundColor Yellow
$signupBody = @{
    email = "demo@example.com"
    password = "password123"
    name = "Demo User"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/signup" -Method POST -Body $signupBody -ContentType "application/json" | ConvertFrom-Json
    $accessToken = $signupResponse.data.accessToken
    $refreshToken = $signupResponse.data.refreshToken
    Write-Host "User registered: $($signupResponse.data.user.email)" -ForegroundColor Green
    Write-Host "Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    # User might already exist, try login
    Write-Host "User already exists, logging in..." -ForegroundColor Yellow
    $loginBody = @{
        email = "demo@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json" | ConvertFrom-Json
    $accessToken = $loginResponse.data.accessToken
    $refreshToken = $loginResponse.data.refreshToken
    Write-Host "Login successful: $($loginResponse.data.user.email)" -ForegroundColor Green
}
Write-Host ""

# 3. Create a meal
Write-Host "3. Create a meal" -ForegroundColor Yellow
$mealBody = @{
    name = "Healthy Breakfast"
    description = "Oatmeal with fruits and nuts"
    mealType = "BREAKFAST"
    date = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    calories = 450
    protein = 15
    carbs = 65
    fat = 12
    notes = "Added blueberries and almonds"
    isPrivate = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

$createMealResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/meals" -Method POST -Body $mealBody -Headers $headers | ConvertFrom-Json
$mealId = $createMealResponse.data.meal.id
Write-Host "Meal created: $($createMealResponse.data.meal.name)" -ForegroundColor Green
Write-Host "Calories: $($createMealResponse.data.meal.calories) | Protein: $($createMealResponse.data.meal.protein)g" -ForegroundColor Gray
Write-Host ""

# 4. Get all meals
Write-Host "4. Get all meals" -ForegroundColor Yellow
$mealsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/meals?limit=10&sortBy=date&sortOrder=desc" -Method GET -Headers $headers | ConvertFrom-Json
Write-Host "Total meals: $($mealsResponse.data.pagination.total)" -ForegroundColor Green
foreach ($meal in $mealsResponse.data.meals) {
    Write-Host "  - $($meal.name) ($($meal.mealType)): $($meal.calories) kcal" -ForegroundColor Gray
}
Write-Host ""

# 5. Get specific meal
Write-Host "5. Get meal by ID" -ForegroundColor Yellow
$mealDetailResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/meals/$mealId" -Method GET -Headers $headers | ConvertFrom-Json
Write-Host "Meal: $($mealDetailResponse.data.meal.name)" -ForegroundColor Green
Write-Host "Date: $($mealDetailResponse.data.meal.date)" -ForegroundColor Gray
Write-Host ""

# 6. Update meal
Write-Host "6. Update meal" -ForegroundColor Yellow
$updateBody = @{
    calories = 500
    notes = "Added extra protein powder"
} | ConvertTo-Json

$updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/meals/$mealId" -Method PATCH -Body $updateBody -Headers $headers | ConvertFrom-Json
Write-Host "Meal updated: Calories changed to $($updateResponse.data.meal.calories)" -ForegroundColor Green
Write-Host ""

# 7. Refresh token
Write-Host "7. Refresh access token" -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$refreshResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/refresh" -Method POST -Body $refreshBody -ContentType "application/json" | ConvertFrom-Json
Write-Host "New access token: $($refreshResponse.data.accessToken.Substring(0, 20))..." -ForegroundColor Green
Write-Host ""

# 8. Filter meals by type
Write-Host "8. Filter meals by type (BREAKFAST)" -ForegroundColor Yellow
$filterResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/meals?mealType=BREAKFAST&limit=5" -Method GET -Headers $headers | ConvertFrom-Json
Write-Host "Breakfast meals found: $($filterResponse.data.meals.Count)" -ForegroundColor Green
Write-Host ""

# 9. Delete meal
Write-Host "9. Delete meal" -ForegroundColor Yellow
$deleteResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/meals/$mealId" -Method DELETE -Headers $headers | ConvertFrom-Json
Write-Host "$($deleteResponse.message)" -ForegroundColor Green
Write-Host ""

# 10. Logout
Write-Host "10. Logout" -ForegroundColor Yellow
$logoutBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

$logoutResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/logout" -Method POST -Body $logoutBody -Headers $headers | ConvertFrom-Json
Write-Host "$($logoutResponse.message)" -ForegroundColor Green
Write-Host ""

Write-Host "=== All tests completed successfully! ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available endpoints:" -ForegroundColor Yellow
Write-Host "  Swagger UI: http://localhost:3000/docs" -ForegroundColor Gray
Write-Host "  Health: http://localhost:3000/health" -ForegroundColor Gray
Write-Host "  Auth: http://localhost:3000/api/v1/auth/*" -ForegroundColor Gray
Write-Host "  Meals: http://localhost:3000/api/v1/meals/*" -ForegroundColor Gray
