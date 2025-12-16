using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class Team
    {
        [Key]
        public Guid Id { get; set; }
        public string Name { get; set; }    
        public Guid ProjectId { get; set; }
        public WorkProject Project { get; set; }
        public ProjectSolution Solution { get; set; }
        public List<TeamMember> Members { get; set; } = new List<TeamMember>();
        public Team() { }
    }
}
