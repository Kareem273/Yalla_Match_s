# Production security configuration

`appsettings.json` deliberately contains no JWT signing secret. Before starting the API outside development, configure these environment variables through the host's secret store or deployment platform:

```text
ConnectionStrings__DefaultConnection=<production SQL Server connection string>
Jwt__Key=<a unique, randomly generated secret of at least 32 characters>
Cors__AllowedOrigins__0=https://admin.example.com
Cors__AllowedOrigins__1=https://app.example.com
AllowedHosts=api.example.com
```

For a local PowerShell session, use the following pattern with your own generated value; do not commit the result:

```powershell
$env:Jwt__Key = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
$env:Cors__AllowedOrigins__0 = 'http://localhost:5174'
```

The API fails fast if a JWT secret is absent or shorter than 32 characters. Development allows local CORS origins for convenience; production requires the explicit allow-list above.

## Database deployment

The migration `SecureCustomerSessionsAndQueryIndexes` changes `Reservations.CustomerSessionId` to a 64-character SHA-256 hash and adds indexes. Existing old client sessions (including the former `guest` identifier) cannot prove ownership under the new model; those users should use their tracking code, while new bookings automatically use a persistent device session.

Review the generated migration against the production schema and back up the database before applying it. The application does not automatically run migrations.
