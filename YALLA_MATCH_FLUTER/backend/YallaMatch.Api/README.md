# Yalla Match API

ASP.NET Core Web API for courts, guest reservations, transfer screenshot verification, QR check-in, reservation tracking, and admin dashboard.

## Run

```powershell
dotnet restore
dotnet run --project .\backend\YallaMatch.Api\YallaMatch.Api.csproj
```

Default admin:

- Email: `admin@yallamatch.local`
- Password: `Admin@12345`

Flutter points to `http://localhost:5078/api` by default. Override with:

```powershell
flutter run --dart-define=API_BASE_URL=http://YOUR_HOST:5000/api
```
