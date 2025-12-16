using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GanttChartAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<User> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
        public async Task<User> GetByIdAsync(Guid id)
        {
             return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }
        public async Task AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        public async Task<List<User>> GetAllAsync() 
        {
            return await _context.Users.ToListAsync();
        }
        public async Task<List<ClassRole>> GetUserClassRolesAsync(Guid userId)
        {
            return await _context.ClassRoles
                .Where(r => r.UserId == userId)
                .ToListAsync();
        }
    }
}
