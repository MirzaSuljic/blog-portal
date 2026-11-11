using BlogLab.Models.Account;
using Dapper;
using Microsoft.AspNetCore.Identity;
using Npgsql;

namespace BlogLab.Repository
{
    public class AccountRepository : IAccountRepository
    {
        private readonly NpgsqlDataSource _dataSource;

        public AccountRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<IdentityResult> CreateAsync(ApplicationUserIdentity user, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

            await connection.ExecuteAsync(new CommandDefinition(
                @"INSERT INTO application_user
                    (username, normalized_username, email, normalized_email, fullname, password_hash)
                  VALUES
                    (@Username, @NormalizedUsername, @Email, @NormalizedEmail, @Fullname, @PasswordHash)",
                user,
                cancellationToken: cancellationToken));

            return IdentityResult.Success;
        }

        public async Task<ApplicationUserIdentity> GetByUsernameAsync(string normalizedUsername, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            await using var connection = await _dataSource.OpenConnectionAsync(cancellationToken);

            return await connection.QuerySingleOrDefaultAsync<ApplicationUserIdentity>(new CommandDefinition(
                @"SELECT application_user_id, username, normalized_username, email, normalized_email, fullname, password_hash
                  FROM application_user
                  WHERE normalized_username = @NormalizedUsername",
                new { NormalizedUsername = normalizedUsername },
                cancellationToken: cancellationToken));
        }
    }
}
