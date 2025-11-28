using GanttChartAPI.DTOs;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using System.Data;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

namespace GanttChartAPI.Services
{
    public class InviteService : IInviteService
    {
        private readonly IInviteRepository _repo;
        private readonly IUserRepository _users;
        private readonly ITopicClassRepository _classes;

        public InviteService(IInviteRepository repo, IUserRepository users, ITopicClassRepository classes)
        {
            _repo = repo;
            _users = users;
            _classes = classes;
        }
        public async Task<ClassInvite> CreateAsync(Guid classId, InviteDto dto)
        {
            var invite = new ClassInvite
            {
                Id = Guid.NewGuid(),
                ClassId = classId,
                IsTeacherInvite = dto.IsTeacherInvite,
                ExpiresAt = DateTime.UtcNow.AddHours(dto.ExpireHours)
            };
            await _repo.AddAsync(invite);
            return invite;
        }
        public async Task UseAsync(Guid inviteId, Guid userId)
        {
            var invite = await _repo.GetByIdAsync(inviteId)
                ?? throw new InvalidOperationException("Приглашение больше не существует");
            if (invite.IsUsed)
                throw new InvalidOperationException("Приглашение уже использовано");
            if (invite.ExpiresAt < DateTime.UtcNow)
                throw new InvalidOperationException("Приглашение больше не действительно");
            if (invite.IsTeacherInvite)
            {
                var rel = new TeacherRelation
                {
                    Id = Guid.NewGuid(),
                    ClassId = invite.ClassId,
                    UserId = userId
                };
                await _classes.AddTeacherAsync(rel);
            }
            else
            {
                var rel = new StudentRelation
                {
                    Id = Guid.NewGuid(),
                    ClassId = invite.ClassId,
                    UserId = userId
                };
                await _classes.AddStudentAsync(rel);
            }
            invite.IsUsed = true;
            await _repo.UpdateAsync(invite);
        }
        public async Task<List<InviteViewModel>> GetAllAsync()
        {
             var invites = await _repo.GetAllAsync();
            return invites.Select(i => new InviteViewModel
            {
                Id = i.Id,
                ClassId = i.ClassId,
                IsTeacherInvite = i.IsTeacherInvite,
                ExpiresAt = i.ExpiresAt,
                IsUsed = i.IsUsed
            }).ToList();
        }
    }
}
