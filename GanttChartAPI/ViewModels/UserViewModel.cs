using GanttChartAPI.Models.Enums;

namespace GanttChartAPI.ViewModels
{
    public class UserViewModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int Role { get; set; }
    }
}
