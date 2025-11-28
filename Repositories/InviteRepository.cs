using GanttChartAPI.Data;
using GanttChartAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace GanttChartAPI.Repositories
{
    public class InviteRepository : IInviteRepository
    {
        private readonly AppDbContext _context;
        public InviteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ClassInvite> GetByIdAsync(Guid id)
        {
            return await _context.Invites.FirstOrDefaultAsync(i => i.Id == id);
        }
        public async Task<List<ClassInvite>> GetAllAsync()
        {
            return await _context.Invites.ToListAsync();
        }
        public async Task AddAsync(ClassInvite invite)
        {
            await _context.Invites.AddAsync(invite);
            await _context.SaveChangesAsync();
        }
        public async Task UpdateAsync(ClassInvite invite) {
            _context.Invites.Update(invite);
            await _context.SaveChangesAsync();
        }
    }
}
