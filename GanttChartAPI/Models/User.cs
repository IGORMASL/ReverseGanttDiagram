using GanttChartAPI.Models.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GanttChartAPI.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        public string FullName { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public SystemRole Role { get; set; }
       
        [Required]
        public string PasswordHash { get; set; }
        public List<StudentRelation> StudentClasses { get; set; } = new List<StudentRelation>();
        public List<TeacherRelation> TeacherClasses { get; set; } = new List<TeacherRelation>();
        public List<TeamMember> Teams { get; set; } = new List<TeamMember>();
        public List <AssignedTask> AssignedTasks { get; set; } = new List<AssignedTask>();

        public User() { }
    }
}
