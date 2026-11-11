using BlogLab.Repository.Database;
using Npgsql;

namespace BlogLab.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            // create the tables in the database on first start
            var dataSource = host.Services.GetRequiredService<NpgsqlDataSource>();
            DatabaseInitializer.EnsureSchemaAsync(dataSource).GetAwaiter().GetResult();

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((context, config) =>
                {
                    // Local secrets (JWT key, Cloudinary keys). This file is in .gitignore.
                    config.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
                    // Environment variables (e.g. Jwt__Key) still win over the file.
                    config.AddEnvironmentVariables();
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
