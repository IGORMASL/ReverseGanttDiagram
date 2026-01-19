using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using System.Data;

namespace GanttChartAPI.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;
        private readonly ILogger<UserService> _logger;
        public UserService(IUserRepository repo, ILogger<UserService> logger) 
        { 
            _repo = repo;
            _logger = logger;
        }

        public async Task<List<UserViewModel>> GetAllAsync() { 
            var users = await _repo.GetAllAsync();
            return users.Select(u => new UserViewModel
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = (int)u.Role,
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
            if(user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found.", userId);
                throw new KeyNotFoundException($"User not found.");
            }
            return new UserViewModel
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = (int)user.Role
            };
        }
        public async Task<UserViewModel> GetByEmailAsync(string email)
        {
            var user = await _repo.GetByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("User with email {Email} not found.", email);
                throw new KeyNotFoundException($"User not found.");
            }
            return new UserViewModel
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = (int)user.Role
            };
        }
        public async Task UpdateNameAsync(Guid userId, UpdateNameDto dto)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found for name update.", userId);
                throw new KeyNotFoundException($"User not found.");
            }
            user.FullName = dto.FullName;
            await _repo.UpdateAsync(user);
        }
        public async Task<bool> VerifyPasswordAsync(Guid userId, VerifyPasswordDto dto)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found for password verification.", userId);
                throw new KeyNotFoundException($"User not found.");
            }
            return PasswordHasher.Verify(user.PasswordHash, dto.CurrentPassword);
        }
        public async Task UpdatePasswordAsync(Guid userId, UpdatePasswordDto dto)
        {
            var user = await _repo.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User with ID {UserId} not found for password update.", userId);
                throw new KeyNotFoundException($"User not found.");
            }
            var newHashedPassword = PasswordHasher.Hash(dto.NewPassword);
            user.PasswordHash = newHashedPassword;
            await _repo.UpdateAsync(user);
        }
    }
}
