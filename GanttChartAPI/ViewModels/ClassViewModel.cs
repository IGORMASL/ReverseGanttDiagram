using System.ComponentModel.DataAnnotations;

namespace GanttChartAPI.ViewModels
{
    public class ClassViewModel
    {
        public Guid Id  { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Color { get; set; }
    }
}
