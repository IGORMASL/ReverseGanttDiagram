namespace GanttChartAPI.Models
{
    public class AssignedTask
    {
        public Guid UserId { get; set; }
        public User User { get; set; }
        public Guid TaskId { get; set; }
        public ProjectTask ProjectTask { get; set; }
        public AssignedTask() { }
    }
}
