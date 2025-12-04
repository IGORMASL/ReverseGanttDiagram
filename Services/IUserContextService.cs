namespace GanttChartAPI.Services
{
    public interface IUserContextService
    {
        Guid GetUserId();
        string GetUserRole();
    }
}
