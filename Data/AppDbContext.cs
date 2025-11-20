using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
            Database.EnsureCreated();
        }
        public DbSet<User> Users { get; set; }
        public DbSet<TopicClass> TopicClasses { get; set; }
        public DbSet<ClassRole> ClassRoles { get; set; }
        public DbSet<StudentRelation> StudentRelations { get; set; }
        public DbSet<TeacherRelation> TeacherRelations { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> ProjectTasks { get; set; }
        public DbSet<AssignedTask> AssignedTasks { get; set; }
        public DbSet<TaskDependency> TaskDependencies { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //Rolement
            modelBuilder.Entity<ClassRole>()
                .HasDiscriminator<string>("RoleType")
                .HasValue<StudentRelation>("Student")
                .HasValue<TeacherRelation>("Teacher");
            modelBuilder.Entity<StudentRelation>()
                .HasOne(r => r.User)
                .WithMany(u => u.StudentClasses)
                .HasForeignKey(r => r.UserId);
            modelBuilder.Entity<StudentRelation>()
                .HasOne(r => r.TopicClass)
                .WithMany(c => c.Students)
                .HasForeignKey(r => r.ClassId);
            modelBuilder.Entity<TeacherRelation>()
                .HasOne(r => r.User)
                .WithMany(u => u.TeacherClasses)
                .HasForeignKey(r => r.UserId);
            modelBuilder.Entity<TeacherRelation>()
                .HasOne(r => r.TopicClass)
                .WithMany(c => c.Teachers)
                .HasForeignKey(r => r.ClassId);
            modelBuilder.Entity<ClassRole>()
                .HasIndex(r => new { r.UserId, r.ClassId })
                .IsUnique();
            //TeamMember
            modelBuilder.Entity<TeamMember>()
                .HasKey(tm => new { tm.UserId, tm.TeamId });
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.User)
                .WithMany(u => u.Teams)
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.Team)
                .WithMany(t => t.Members)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
            // AssignedTask
            modelBuilder.Entity<AssignedTask>()
                .HasKey(at => new { at.UserId, at.TaskId });
            modelBuilder.Entity<AssignedTask>()
                .HasOne(at => at.User)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(at => at.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<AssignedTask>()
                .HasOne(at => at.ProjectTask)
                .WithMany(t => t.AssignedUsers)
                .HasForeignKey(at => at.TaskId)
                .OnDelete(DeleteBehavior.Cascade);
            //ProjectTask
            modelBuilder.Entity<ProjectTask>()
                .HasOne(pt => pt.Project)
                .WithMany(p => p.ProjectTasks)
                .HasForeignKey(pt => pt.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ProjectTask>()
                .HasOne(pt => pt.ParentTask)
                .WithMany(pt => pt.Subtasks)
                .HasForeignKey(pt => pt.ParentTaskId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ProjectTask>()
                .HasMany(pt => pt.PredecessorTasks)
                .WithOne(td => td.DependentTask)
                .HasForeignKey(td => td.DependentTaskId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<ProjectTask>()
                .HasMany(pt => pt.DependentTasks)
                .WithOne(td => td.PredecessorTask)
                .HasForeignKey(td => td.PredecessorTaskId)
                .OnDelete(DeleteBehavior.Cascade);
            //TaskDependency
            modelBuilder.Entity<TaskDependency>()
                .HasKey(td => new { td.DependentTaskId, td.PredecessorTaskId });
            modelBuilder.Entity<TaskDependency>()
                .HasOne(td => td.DependentTask)
                .WithMany(pt => pt.PredecessorTasks)
                .HasForeignKey(td => td.DependentTaskId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<TaskDependency>()
                .HasOne(td => td.PredecessorTask)
                .WithMany(pt => pt.DependentTasks)
                .HasForeignKey(td => td.PredecessorTaskId)
                .OnDelete(DeleteBehavior.Cascade);
            //Project
            modelBuilder.Entity<Project>()
                .HasOne(p => p.TopicClass)
                .WithMany(c => c.Projects)
                .HasForeignKey(p => p.TopicClassId)
                .OnDelete(DeleteBehavior.Cascade);
            //Team
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Teams)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);


        }
    } 
}
    
