using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.ViewModels
{
    public class TaskTreeViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectTaskType Type { get; set; }
        public ProjectTaskStatus Status { get; set; }
        public List<UserViewModel> AssignedUsers { get; set; }
        public List<Guid> Dependencies { get; set; }
        public List<TaskTreeViewModel> Subtasks { get; set; }

    }
}

