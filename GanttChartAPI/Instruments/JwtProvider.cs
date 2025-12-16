using GanttChartAPI.Models;
using GanttChartAPI.ViewModels;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GanttChartAPI.Instruments
{
    public class JwtProvider
    {
        private readonly IConfiguration _config;

        public JwtProvider(IConfiguration config)
        {
            _config = config;
        }

        public AuthResponseViewModel Generate(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"])
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expires = DateTime.UtcNow.AddHours(2);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var handler = new JwtSecurityTokenHandler();

            var token = handler.CreateJwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                subject: new ClaimsIdentity(claims),
                notBefore: DateTime.UtcNow,
                expires: expires,
                signingCredentials: creds
            );

            return new AuthResponseViewModel
            {
                Token = handler.WriteToken(token),
                ExpiresAt = expires
            };
        }

    }
}
