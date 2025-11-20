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
        [ForeignKey("ProjectId")]
        public Project Project { get; set; }
        
        public List<TeamMember> Members { get; set; } = new List<TeamMember>();

        public Team() { }
    }
}
