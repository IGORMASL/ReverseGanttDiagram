using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.ViewModels
{
    public class TaskViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectTaskType Type { get; set; }
        public ProjectTaskStatus Status { get; set; }
        public Guid? ParentTaskId { get; set; }
        public List<TeamMemberViewModel> AssignedUsers { get; set; }
        public List<Guid> Dependencies { get; set; }
    }
}

