using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        public UserService(IUserRepository repo) 
        { 
            _repo = repo; 
        }

        public async Task<List<UserViewModel>> GetAllAsync() { 
            var users = await _repo.GetAllAsync();
            return users.Select(u => new UserViewModel
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
            }).ToList();
        }
        public async Task<List<ClassRoleViewModel>> GetUserClassRolesAsync(Guid userId)
        {
            var roles = await _repo.GetUserClassRolesAsync(userId);
            return roles.Select(cr => new ClassRoleViewModel
            {
                ClassId = cr.ClassId,
                Role = cr is StudentRelation ? 0 :
                       cr is TeacherRelation ? 1 : -1
            }).ToList();
            
        }
        public async Task<UserViewModel> GetByIdAsync(Guid userId)
        {
            var user = await _repo.GetByIdAsync(userId);
            return new UserViewModel
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
