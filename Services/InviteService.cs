using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
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
        private readonly ITopicClassRepository _classes;

        public InviteService(IInviteRepository repo, ITopicClassRepository classes)
        {
            _repo = repo;
            _classes = classes;
        }
        public async Task<ClassInvite> CreateAsync(Guid classId, InviteDto dto)
        {
            if(await _classes.GetByIdAsync(classId) == null)
                throw new NotFoundException("Такой класс не существует");
            var invite = new ClassInvite
            {
                Id = Guid.NewGuid(),
                ClassId = classId,
                IsTeacherInvite = dto.IsTeacherInvite,
                IsMultiUse = dto.IsMultiUse,
                ExpiresAt = DateTime.UtcNow.AddHours(dto.ExpireHours)
            };
            await _repo.AddAsync(invite);
            return invite;
        }
        public async Task UseAsync(Guid inviteId, Guid userId)
        {
            var invite = await _repo.GetByIdAsync(inviteId)
                ?? throw new NotFoundException("Приглашение не существует");
            if (!invite.IsMultiUse && invite.IsUsed)
                throw new InvitationUsedException();
            if (invite.ExpiresAt < DateTime.UtcNow)
                throw new InvitationExpiredException();
            if (await _classes.IsUserInClassAsync(userId, invite.ClassId))
                throw new InvalidOperationException("Пользователь уже состоит в этом классе");
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
            if (!invite.IsMultiUse)
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
                IsMultiUse = i.IsMultiUse,
                IsUsed = i.IsUsed
            }).ToList();
        }
    }
}
