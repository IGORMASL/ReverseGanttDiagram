using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context)
        {
            _context = context;
        }
        public Task<User> GetByEmailAsync(string email)
        => _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        public Task<User> GetByIdAsync(Guid id) =>
            _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        public async Task AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
    }
}
