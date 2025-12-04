using GanttChartAPI.DTOs;
using GanttChartAPI.Instruments;
using GanttChartAPI.Models;
using GanttChartAPI.Repositories;
using GanttChartAPI.ViewModels;
using System.Data;

namespace GanttChartAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _repository;
        private readonly JwtProvider _token;
        private readonly ILogger<AuthService> _logger;
        public AuthService(IUserRepository repository, JwtProvider token, ILogger<AuthService> logger)
        {
            _repository = repository;
            _token = token;
            _logger = logger;
        }
        public async Task<AuthResponseViewModel> RegisterAsync(RegisterDto dto)
        {
            _logger.LogInformation("Registering new user with email: {Email}", dto.Email);

            var existingUser = await _repository.GetByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration failed: Email {Email} is already in use.", dto.Email);
                throw new ConflictException("Email is already in use.");
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
            _logger.LogInformation("User registered successfully with email: {Email}", dto.Email);
            return _token.Generate(newUser);
        }

        public async Task<AuthResponseViewModel> LoginAsync(LoginDto dto)
        {
            _logger.LogInformation("Attempting login for email: {Email}", dto.Email);
            var user = await _repository.GetByEmailAsync(dto.Email);
            if (user == null)
            {
                _logger.LogWarning("Login failed for email: {Email} - user not found.", dto.Email);
                throw new ConflictException("Invalid email or password.");
            }
            if(!PasswordHasher.Verify(user.PasswordHash, dto.Password))
            {
                _logger.LogWarning("Login failed for email: {Email} - invalid password.", dto.Email);
                throw new ConflictException("Invalid email or password.");
            }
            _logger.LogInformation("User logged in successfully with email: {Email}", dto.Email);
            return _token.Generate(user);
        }

    }
}
