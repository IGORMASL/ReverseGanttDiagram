namespace GanttChartAPI.ViewModels
{
    public class TeamViewModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid ProjectId { get; set; }
        public List<TeamMemberViewModel> Members { get; set; }
    }
}
