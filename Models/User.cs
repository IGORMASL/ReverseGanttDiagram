using System.ComponentModel.DataAnnotations;

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
       
        [Required]
        public string PasswordHash { get; set; }
    }
}
