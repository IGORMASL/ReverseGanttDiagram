using Microsoft.EntityFrameworkCore.Metadata.Conventions;

namespace GanttChartAPI.Instruments
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (NotFoundException ex)
            {
                _logger.LogWarning(ex, "Not found");
                await WriteError(context, StatusCodes.Status404NotFound, ex.Message);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning(ex, "Validation failed");
                await WriteError(context, StatusCodes.Status400BadRequest, ex.Message);
            }
            catch (UnauthorizedException ex)
            {
                _logger.LogWarning(ex, "Unauthorized");
                await WriteError(context, StatusCodes.Status401Unauthorized, ex.Message);
            }
            catch (ConflictException ex)
            {
                _logger.LogWarning(ex, "Conflict");
                await WriteError(context, StatusCodes.Status409Conflict, ex.Message);
            }
            catch (ForbiddenException ex)
            {
                _logger.LogWarning(ex, "Forbidden");
                await WriteError(context, StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (InvitationUsedException ex)
            {
                _logger.LogWarning(ex, ex.Message);
                await WriteError(context, StatusCodes.Status400BadRequest, ex.Message);
            }
            catch (InvitationExpiredException ex)
            {
                _logger.LogWarning(ex, ex.Message);
                await WriteError(context, StatusCodes.Status400BadRequest, ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, ex.Message);
                await WriteError(context, StatusCodes.Status400BadRequest, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unexpected error occurred");
                await WriteError(context, StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }
        private Task WriteError(HttpContext context, int status, string message)
        {
            context.Response.StatusCode = status;
            return context.Response.WriteAsJsonAsync(new { error = message });
        }
    }
}
