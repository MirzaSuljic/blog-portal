using System.Net;
using BlogLab.Models.Exception;
using Microsoft.AspNetCore.Diagnostics;

namespace BlogLab.Web.Extensions
{
    public static class ExceptionMiddlewareExtensions
    {
        /// <summary>
        /// Returns every unhandled exception as JSON { statusCode, message }.
        /// With includeDetails (Development) the real reason is sent, e.g. "Cannot open database BlogDB".
        /// </summary>
        public static void ConfigureExceptionHandler(this IApplicationBuilder app, bool includeDetails)
        {
            app.UseExceptionHandler(appError =>
            {
                appError.Run(async context =>
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";

                    var feature = context.Features.Get<IExceptionHandlerFeature>();
                    if (feature == null) return;

                    var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("BlogLab");
                    logger.LogError(feature.Error, "Unhandled exception on {Path}", context.Request.Path);

                    var root = feature.Error.GetBaseException();

                    await context.Response.WriteAsync(new ApiException
                    {
                        StatusCode = context.Response.StatusCode,
                        Message = includeDetails ? $"{root.GetType().Name}: {root.Message}" : "Internal Server Error"
                    }.ToString());
                });
            });
        }
    }
}
