using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class TopicClass
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        
        [InverseProperty("TopicClass")]
        public List<WorkProject> Projects { get; set; } = new List<WorkProject>();

        public List<TeacherRelation> Teachers { get; set; } = new List<TeacherRelation>();

        public List<StudentRelation> Students { get; set; } = new List<StudentRelation>();
        
        [InverseProperty("Class")]
        public List<ClassInvite> Invites { get; set; } = new List<ClassInvite>();
        public string Color { get; set; }
        public TopicClass() { }
    }
}
