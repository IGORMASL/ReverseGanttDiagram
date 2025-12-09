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
        private readonly IUserRepository _users;
        private readonly ITeamRepository _teams;
        public TopicClassService(ITopicClassRepository classes,
            IClassRelationRepository relations,
            IUserRepository users,
            ITeamRepository teams)
        {
            _classes = classes;
            _relations = relations;
            _users = users;
            _teams = teams;
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
            topic.Color = dto.Color;
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
                Id = t.Id,
                FullName = t.FullName,
                Email = t.Email,
                ClassRole = 1
            }).Concat(students.Select(s => new ClassMemberViewModel
            {
                Id = s.Id,
                FullName = s.FullName,
                Email = s.Email,
                ClassRole = 0
            })).ToList();
            return members;
        }
        public async Task AddClassMemberByEmailAsync(string userRole, Guid userId, Guid classId, string memberEmail, string memberClassRole)
        {
            var topic = await _classes.GetByIdAsync(classId)
                ?? throw new NotFoundException("Класс не найден");
            var userClassRole = await _relations.GetUserClassRoleAsync(userId, classId);
            if (userRole != "Admin" && userClassRole is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет прав для добавления участников в класс");
            }
            var userToAdd = await _users.GetByEmailAsync(memberEmail)
                ?? throw new NotFoundException("Пользователь с таким email не найден");
            var isUserInClass = await _relations.IsUserInClassAsync(userToAdd.Id, classId);
            if (isUserInClass)
            {
                throw new ConflictException("Пользователь уже является участником класса");
            }
            if (memberClassRole == "Student")
            {
                var newRelation = new StudentRelation
                {
                    Id = Guid.NewGuid(),
                    ClassId = classId,
                    UserId = userToAdd.Id
                };
                await _relations.AddStudentAsync(newRelation);
            }
            else if (memberClassRole == "Teacher")
            {
                var newRelation = new TeacherRelation
                {
                    Id = Guid.NewGuid(),
                    ClassId = classId,
                    UserId = userToAdd.Id
                };
                await _relations.AddTeacherAsync(newRelation);
            }
            else
            {
                throw new ArgumentException("Некорректная роль класса");
            }
        }

        public async Task RemoveClassMemberAsync(string userRole, Guid userId, Guid classId, Guid memberId)
        {
            var topic = await _classes.GetByIdAsync(classId)
                ?? throw new NotFoundException("Класс не найден");
            var userClassRole = await _relations.GetUserClassRoleAsync(userId, classId);
            if (userRole != "Admin" && userClassRole is not TeacherRelation)
            {
                throw new ForbiddenException("У вас нет прав для удаления участников из класса");
            }
            var memberRelation = await _relations.GetUserClassRoleAsync(memberId, classId)
                ?? throw new NotFoundException("Пользователь не является участником класса");
            if (memberRelation is StudentRelation studentRelation)
            {
                await _relations.RemoveStudentAsync(studentRelation);
            }
            else if (memberRelation is TeacherRelation teacherRelation)
            {
                await _relations.RemoveTeacherAsync(teacherRelation);
            }
        }
    }
}
