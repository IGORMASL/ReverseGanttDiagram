namespace GanttChartAPI.Instruments
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message){ }
    }
    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message) : base(message) { }
    }
    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }
    public class UnauthorizedException : Exception
    {
        public UnauthorizedException(string message) : base(message) { }
    }
    public class ValidationException : Exception
    {
        public ValidationException(string message) : base(message) { }
    }
    public class InvitationUsedException : Exception
    {
        public InvitationUsedException() : base("Приглашение уже использовано") { }
    }

    public class InvitationExpiredException : Exception
    {
        public InvitationExpiredException() : base("Приглашение больше не действительно") { }
    }
}
