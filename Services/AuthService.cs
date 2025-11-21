using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;

namespace GanttChartAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repository;
        private readonly JwtProvider _token;
        public AuthService(IUserRepository repository, JwtProvider token)
        {
            _repository = repository;
            _token = token;
        }
        public async Task<AuthResponseViewModel> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _repository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new Exception("User with this email already exists.");
            }
            var hashedPassword = PasswordHasher.Hash(dto.Password);
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = hashedPassword
            };
            await _repository.AddAsync(newUser);
            return _token.Generate(newUser);
        }

        public async Task<AuthResponseViewModel> LoginAsync(LoginDto dto)
        {
            var user = await _repository.GetByEmailAsync(dto.Email);
            if (user == null || !PasswordHasher.Verify(user.PasswordHash, dto.Password))
            {
                throw new Exception("Invalid email or password.");
            }
            return _token.Generate(user);
        }

    }
}
