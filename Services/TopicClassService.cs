using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace GanttChartAPI.Services
{
    public class TopicClassService : ITopicClassService
    {
        private readonly ITopicClassRepository _classes;
        private readonly IClassRelationRepository _relations;
        public TopicClassService(ITopicClassRepository classes, IClassRelationRepository relations)
        {
            _classes = classes;
            _relations = relations;
        }
        public async Task<List<ClassViewModel>> GetAllAsync()
        {
            var classes = await _classes.GetAllAsync();
            return classes.Select(c => new ClassViewModel
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,
                Color = c.Color

            }).ToList();
        }
        public async Task<ClassViewModel> GetByIdAsync(string userRole, Guid userId, Guid classId)
        {
            var topic = await _classes.GetByIdAsync(classId)
                ?? throw new NotFoundException("Класс не найден");
            var isUserInClass = await _relations.IsUserInClassAsync(userId, classId);
            if (userRole != "Admin" && !isUserInClass)
            {
                throw new ForbiddenException("У вас нет доступа к этому классу");
            }

            return new ClassViewModel
            {
                Id = topic.Id,
                Title = topic.Title,
                Description = topic.Description,
                Color = topic.Color
            };
        }

        public async Task<ClassViewModel> CreateAsync(ClassDto dto)
        {
            var topic = new TopicClass
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description,
                Color = dto.Color
            };
            await _classes.CreateAsync(topic);
            return new ClassViewModel
            {
                Id = topic.Id,
                Title = topic.Title,
                Description = topic.Description,
                Color = topic.Color
            };
        }

        public async Task<ClassViewModel> UpdateAsync(string userRole, Guid userId, Guid classId, ClassDto dto)
        {
            var topic = await _classes.GetByIdAsync(classId)
                ?? throw new NotFoundException("Класс не найден");
            var userClassRole = await _relations.GetUserClassRoleAsync(userId, classId); 
            if (userRole != "Admin" && userClassRole is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет прав для изменения класса");
            }
            topic.Title = dto.Title;
            topic.Description = dto.Description;
            await _classes.UpdateAsync(topic);
            return new ClassViewModel
            {
                Id = topic.Id,
                Title = topic.Title,
                Description = topic.Description,
                Color = topic.Color
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var topic = await _classes.GetByIdAsync(id)
                ?? throw new NotFoundException("Класс не найден");
            await _classes.DeleteAsync(topic);
        }

        public async Task<List<UserClassViewModel>> GetUserClassesAsync(Guid userId)
        {
            var studentRoles = await _relations.GetUserStudentsRelationsAsync(userId);
            var teacherRoles = await _relations.GetUserTeachersRelationsAsync(userId);

            var userClasses = studentRoles.Select(r => new UserClassViewModel
            {
                ClassId = r.TopicClass.Id,
                ClassName = r.TopicClass.Title,
                Description = r.TopicClass.Description,
                Color = r.TopicClass.Color,
                Role = 0
            })
            .Concat(teacherRoles.Select(r => new UserClassViewModel
            {
                ClassId = r.TopicClass.Id,
                ClassName = r.TopicClass.Title,
                Description = r.TopicClass.Description,
                Color = r.TopicClass.Color,
                Role = 1
            })).ToList();
            return userClasses;
        }
        public async Task<List<ClassMemberViewModel>> GetClassMembersAsync(string userRole, Guid userId, Guid classId)
        {
            var topic = await _classes.GetByIdAsync(classId)
                ?? throw new NotFoundException("Класс не найден");
            var userClassRole = await _relations.GetUserClassRoleAsync(userId, classId);
            if (userRole != "Admin" && userClassRole == null)
            {
                throw new ForbiddenException("Вы не можете просмотреть участников класса");
            }
            var teachers = await _classes.GetClassTeachersAsync(classId);
            var students = await _classes.GetClassStudentsAsync(classId);
            var members = teachers.Select(t => new ClassMemberViewModel
            {
                FullName = t.FullName,
                Email = t.Email,
                ClassRole = 1
            }).Concat(students.Select(s => new ClassMemberViewModel
            {
                FullName = s.FullName,
                Email = s.Email,
                ClassRole = 0
            })).ToList();
            return members;
        }
    }
}
