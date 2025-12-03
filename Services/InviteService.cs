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
        private readonly IInviteRepository _invites;
        private readonly ITopicClassRepository _classes;
        private readonly IClassRelationRepository _relations;

        public InviteService(IInviteRepository repo, 
            ITopicClassRepository classes, IClassRelationRepository relations)
        {
            _invites = repo;
            _classes = classes;
            _relations = relations;
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
            await _invites.AddAsync(invite);
            return invite;
        }
        public async Task UseAsync(Guid inviteId, Guid userId)
        {
            var invite = await _invites.GetByIdAsync(inviteId)
                ?? throw new NotFoundException("Приглашение не существует");
            if (!invite.IsMultiUse && invite.IsUsed)
                throw new InvitationUsedException();
            if (invite.ExpiresAt < DateTime.UtcNow)
                throw new InvitationExpiredException();
            if (await _relations.IsTeacherInClassAsync(userId, invite.ClassId))
                throw new InvalidOperationException("Пользователь уже является преподавателем в данном классе");
            if (await _relations.IsStudentInClassAsync(userId, invite.ClassId))
                throw new InvalidOperationException("Пользователь уже является студентом в данном классе");
            if (invite.IsTeacherInvite)
            {
                var rel = new TeacherRelation
                {
                    Id = Guid.NewGuid(),
                    ClassId = invite.ClassId,
                    UserId = userId
                };
                await _relations.AddTeacherAsync(rel);
            }
            else
            {
                var rel = new StudentRelation
                {
                    Id = Guid.NewGuid(),
                    ClassId = invite.ClassId,
                    UserId = userId
                };
                await _relations.AddStudentAsync(rel);
            }
            if (!invite.IsMultiUse)
                invite.IsUsed = true;
            await _invites.UpdateAsync(invite);
        }
        public async Task<List<InviteViewModel>> GetAllAsync()
        {
             var invites = await _invites.GetAllAsync();
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
