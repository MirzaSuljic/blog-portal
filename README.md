# BlogLab – blog portal

A blogging site where people register, write blogs with an optional photo, keep a photo album and discuss blogs in threaded comments. The most discussed blogs are featured on the home page.

| Part | Tech |
| --- | --- |
| `BlogLab.Web` | ASP.NET Core Web API on **.NET 10**, JWT auth |
| `BlogLab.Identity` | ASP.NET Core Identity with a custom Dapper user store |
| `BlogLab.Repository` | **Dapper** + **Npgsql**, PostgreSQL on **Neon** |
| `BlogLab.Services` | JWT token creation, **Cloudinary** photo upload |
| `BlogLab.Models` | DTOs |
| `BlogLab-UI` | **Angular 22** (standalone components, signals), Bootstrap 5, Font Awesome 6 |

## Run it locally

### 1. Database (Neon PostgreSQL)

Create a database (for example `blogdb`) in your [Neon](https://console.neon.tech) project and copy its connection string.
The API creates the tables itself on first start (`BlogLab.Repository/Database/schema.sql`).

### 2. Secrets

Secrets are **not** in git. Create `BlogLab.Web/appsettings.Local.json` (it is ignored):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://<user>:<password>@<host>/blogdb?sslmode=require"
  },
  "Jwt": { "Key": "<a random string of at least 64 characters>" },
  "CloudinaryOptions": {
    "CloudName": "<cloud name>",
    "ApiKey": "<api key>",
    "ApiSecret": "<api secret>"
  }
}
```

Both the `postgresql://` URL Neon shows and the `Host=...;Database=...` form work.
Environment variables work too (`ConnectionStrings__DefaultConnection`, `Jwt__Key`, …).

### 3. API

Requires the [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
cd BlogLab.Web
dotnet run
```

The API listens on http://localhost:5000.

### 4. Frontend

Requires Node.js 22 or newer.

```bash
cd BlogLab-UI
npm install
npm start
```

Open http://localhost:4200.

## Configuration

| Key | Default | Meaning |
| --- | --- | --- |
| `ConnectionStrings:DefaultConnection` | – (required) | Neon PostgreSQL database |
| `Jwt:Key` | – (required) | signing key for login tokens |
| `Jwt:Issuer` | `http://localhost:5000` | token issuer and audience |
| `CloudinaryOptions:*` | – | photo storage |
| `Cors:AllowedOrigins` | `http://localhost:4200` | where the Angular app runs |
