using GanttChartAPI.DTOs;
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
                ?? throw new Exception("Класс не найден");

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
            await repository.UpdateAsync(id, dto);

            var topic = await repository.GetByIdAsync(id);
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
                ?? throw new Exception("Класс не найден");
            await repository.DeleteAsync(topic);
        }

        public async Task<List<UserClassViewModel>> GetUserClasses(Guid userId)
        {

            var userClasses = await repository.GetUserClasses(userId);
            return userClasses;
        }
    }
}
