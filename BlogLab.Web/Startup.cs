using System.Text;
using BlogLab.Identity;
using BlogLab.Models.Account;
using BlogLab.Models.Settings;
using BlogLab.Repository;
using BlogLab.Repository.Database;
using BlogLab.Services;
using BlogLab.Web.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

namespace BlogLab.Web
{
    public class Startup
    {
        private const string CorsPolicy = "BlogLabUi";

        public IConfiguration Configuration { get; }

        public Startup(IConfiguration config)
        {
            Configuration = config;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            var jwtKey = Configuration["Jwt:Key"];
            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "Jwt:Key is missing. Put it in BlogLab.Web/appsettings.Local.json or set the Jwt__Key environment variable.");
            }

            // PostgreSQL (Neon). Accepts the postgresql:// URL Neon shows as well.
            Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
            var connectionString = DatabaseInitializer.ToNpgsqlConnectionString(
                Configuration.GetConnectionString("DefaultConnection"));
            services.AddSingleton(_ => NpgsqlDataSource.Create(connectionString));

            services.Configure<CloudinaryOptions>(Configuration.GetSection("CloudinaryOptions"));

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IPhotoService, PhotoService>();

            services.AddScoped<IBlogRepository, BlogRepository>();
            services.AddScoped<IBlogCommentRepository, BlogCommentRepository>();
            services.AddScoped<IAccountRepository, AccountRepository>();
            services.AddScoped<IPhotoRepository, PhotoRepository>();

            services.AddIdentityCore<ApplicationUserIdentity>(options =>
            {
                options.Password.RequireNonAlphanumeric = false;
            })
                .AddUserStore<UserStore>()
                .AddDefaultTokenProviders()
                .AddSignInManager<SignInManager<ApplicationUserIdentity>>();

            services.AddControllers();

            var allowedOrigins = Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                                 ?? new[] { "http://localhost:4200" };

            services.AddCors(options =>
            {
                options.AddPolicy(CorsPolicy, policy => policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod());
            });

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    // Keep the short JWT claim names ("nameid", "unique_name") that the controllers read.
                    options.MapInboundClaims = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidAudience = Configuration["Jwt:Issuer"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                        ClockSkew = TimeSpan.Zero
                    };
                });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // JSON errors in every environment; in Development they carry the real reason.
            app.ConfigureExceptionHandler(includeDetails: env.IsDevelopment());

            app.UseRouting();

            app.UseCors(CorsPolicy);

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
