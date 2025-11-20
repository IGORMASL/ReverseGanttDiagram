using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class TaskDependency
    {
        public Guid DependentTaskId { get; set; }
        [ForeignKey("DependentTaskId")]
        public ProjectTask DependentTask { get; set; }
        public Guid PredecessorTaskId { get; set; }
        [ForeignKey("PredecessorTaskId")]
        public ProjectTask PredecessorTask { get; set; }
        public TaskDependency()
        {
        }
    }
}
