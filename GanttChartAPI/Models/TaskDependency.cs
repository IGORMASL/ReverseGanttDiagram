namespace GanttChartAPI.Models
{
    public class TaskDependency
    {
        public Guid TaskId { get; set; }
        public ProjectTask Task { get; set; }
        public Guid DependsOnTaskId { get; set; }
        public ProjectTask DependsOnTask { get; set; }
    }
}
