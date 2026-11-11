using Dapper;
using Npgsql;

namespace BlogLab.Repository.Database
{
    public static class DatabaseInitializer
    {
        static DatabaseInitializer()
        {
            // map snake_case columns (application_user_id) to PascalCase properties (ApplicationUserId)
            DefaultTypeMap.MatchNamesWithUnderscores = true;
        }

        /// <summary>Creates the tables and views if they do not exist yet.</summary>
        public static async Task EnsureSchemaAsync(NpgsqlDataSource dataSource)
        {
            await using var stream = typeof(DatabaseInitializer).Assembly
                .GetManifestResourceStream("BlogLab.Repository.schema.sql")
                ?? throw new InvalidOperationException("schema.sql is not embedded in BlogLab.Repository.");
            using var reader = new StreamReader(stream);
            var sql = await reader.ReadToEndAsync();

            await using var connection = await dataSource.OpenConnectionAsync();
            await connection.ExecuteAsync(sql);
        }

        /// <summary>
        /// Accepts both Npgsql strings ("Host=...;Database=...") and the URL Neon shows
        /// ("postgresql://user:password@host/db?sslmode=require").
        /// </summary>
        public static string ToNpgsqlConnectionString(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.StartsWith("PASTE_", StringComparison.Ordinal))
            {
                throw new InvalidOperationException(
                    "ConnectionStrings:DefaultConnection is empty. Put the Neon connection string in BlogLab.Web/appsettings.Local.json.");
            }

            if (!value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
                !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            {
                return value;
            }

            var uri = new Uri(value);
            var userInfo = uri.UserInfo.Split(':', 2);

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.IsDefaultPort || uri.Port <= 0 ? 5432 : uri.Port,
                Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
                Username = Uri.UnescapeDataString(userInfo[0]),
                Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
                SslMode = SslMode.Require
            };

            return builder.ConnectionString;
        }
    }
}
