$body = '{"email":"admin@govease.ai","password":"admin123"}'
Invoke-RestMethod -Uri 'http://localhost:3001/api/admin/auth/login' -Method Post -ContentType 'application/json' -Body $body