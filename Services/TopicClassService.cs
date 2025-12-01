using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace GanttChartAPI.Services
{
    public class TopicClassService : ITopicClassService
    {
        private readonly ITopicClassRepository repository;
        public TopicClassService(ITopicClassRepository repo)
        {
            repository = repo;
        }
        public async Task<List<ClassViewModel>> GetAllAsync()
        {
            var classes = await repository.GetAllAsync();
            return classes.Select(c => new ClassViewModel
            {
                Id = c.Id,
                Title = c.Title,
                Description = c.Description,

            }).ToList();
        }
        public async Task<ClassViewModel> GetByIdAsync(Guid id)
        {
            var topic = await repository.GetByIdAsync(id)
                ?? throw new NotFoundException("Класс не найден");

            return new ClassViewModel
            {
                Id = topic.Id,
                Title = topic.Title,
                Description = topic.Description
            };
        }

        public async Task<ClassViewModel> CreateAsync(ClassDto dto)
        {
            var topic = new TopicClass
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Description = dto.Description
            };
            await repository.CreateAsync(topic);
            return new ClassViewModel
            {
                Id = topic.Id,
                Title = topic.Title,
                Description = topic.Description
            };
        }

        public async Task<ClassViewModel> UpdateAsync(Guid id, ClassDto dto)
        {
            var topic = await repository.GetByIdAsync(id)
                ?? throw new NotFoundException("Класс не найден");
            await repository.UpdateAsync(id, dto);
            return new ClassViewModel
            {
                Id = topic.Id,
                Title = topic.Title,
                Description = topic.Description
            };
        }

        public async Task DeleteAsync(Guid id)
        {
            var topic = await repository.GetByIdAsync(id)
                ?? throw new NotFoundException("Класс не найден");
            await repository.DeleteAsync(topic);
        }

        public async Task<List<UserClassViewModel>> GetUserClassesAsync(Guid userId)
        {
            var studentRoles = await repository.GetStudentsRelationsAsync(userId);
            var teacherRoles = await repository.GetTeachersRelationsAsync(userId);

            var userClasses = studentRoles.Select(r => new UserClassViewModel
            {
                ClassId = r.TopicClass.Id,
                ClassName = r.TopicClass.Title,
                Description = r.TopicClass.Description,
                Role = 0
            })
            .Concat(teacherRoles.Select(r => new UserClassViewModel
            {
                ClassId = r.TopicClass.Id,
                ClassName = r.TopicClass.Title,
                Description = r.TopicClass.Description,
                Role = 1
            })).ToList();
            return userClasses;
        }
    }
}
