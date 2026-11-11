using BlogLab.Models.Blog;
using Dapper;
using Npgsql;

namespace BlogLab.Repository
{
    public class BlogRepository : IBlogRepository
    {
        private const string BlogColumns =
            "blog_id, application_user_id, username, title, content, photo_id, publish_date, update_date";

        private readonly NpgsqlDataSource _dataSource;

        public BlogRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<int> DeleteAsync(int blogId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();
            await using var transaction = await connection.BeginTransactionAsync();

            await connection.ExecuteAsync(
                "UPDATE blog_comment SET active_ind = FALSE, update_date = now() WHERE blog_id = @BlogId",
                new { BlogId = blogId }, transaction);

            var affectedRows = await connection.ExecuteAsync(
                "UPDATE blog SET photo_id = NULL, active_ind = FALSE, update_date = now() WHERE blog_id = @BlogId",
                new { BlogId = blogId }, transaction);

            await transaction.CommitAsync();
            return affectedRows;
        }

        public async Task<PagedResults<Blog>> GetAllAsync(BlogPaging blogPaging)
        {
            var page = Math.Max(1, blogPaging.Page);
            var pageSize = Math.Clamp(blogPaging.PageSize, 1, 50);

            await using var connection = await _dataSource.OpenConnectionAsync();

            using var multi = await connection.QueryMultipleAsync(
                $@"SELECT {BlogColumns} FROM blog_view
                   WHERE active_ind
                   ORDER BY blog_id
                   LIMIT @PageSize OFFSET @Offset;

                   SELECT COUNT(*)::int FROM blog_view WHERE active_ind;",
                new { Offset = (page - 1) * pageSize, PageSize = pageSize });

            return new PagedResults<Blog>
            {
                Items = (await multi.ReadAsync<Blog>()).ToList(),
                TotalCount = await multi.ReadFirstAsync<int>()
            };
        }

        public async Task<List<Blog>> GetAllByUserIdAsync(int applicationUserId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            var blogs = await connection.QueryAsync<Blog>(
                $@"SELECT {BlogColumns} FROM blog_view
                   WHERE application_user_id = @ApplicationUserId AND active_ind
                   ORDER BY blog_id",
                new { ApplicationUserId = applicationUserId });

            return blogs.ToList();
        }

        public async Task<List<Blog>> GetAllFamousAsync()
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            var blogs = await connection.QueryAsync<Blog>(
                @"SELECT b.blog_id, b.application_user_id, b.username, b.title, b.content, b.photo_id,
                         b.publish_date, b.update_date
                  FROM blog_view b
                  JOIN blog_comment c ON c.blog_id = b.blog_id AND c.active_ind
                  WHERE b.active_ind
                  GROUP BY b.blog_id, b.application_user_id, b.username, b.title, b.content, b.photo_id,
                           b.publish_date, b.update_date
                  ORDER BY COUNT(c.blog_comment_id) DESC
                  LIMIT 6");

            return blogs.ToList();
        }

        public async Task<Blog> GetAsync(int blogId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            return await connection.QueryFirstOrDefaultAsync<Blog>(
                $"SELECT {BlogColumns} FROM blog_view WHERE blog_id = @BlogId AND active_ind",
                new { BlogId = blogId });
        }

        public async Task<Blog> UpsertAsync(BlogCreate blogCreate, int applicationUserId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            var parameters = new
            {
                blogCreate.BlogId,
                blogCreate.Title,
                blogCreate.Content,
                blogCreate.PhotoId,
                ApplicationUserId = applicationUserId
            };

            int? blogId;

            if (blogCreate.BlogId > 0)
            {
                // only the author can change an existing blog
                blogId = await connection.ExecuteScalarAsync<int?>(
                    @"UPDATE blog
                      SET title = @Title, content = @Content, photo_id = @PhotoId, update_date = now()
                      WHERE blog_id = @BlogId AND application_user_id = @ApplicationUserId AND active_ind
                      RETURNING blog_id",
                    parameters);
            }
            else
            {
                blogId = await connection.ExecuteScalarAsync<int>(
                    @"INSERT INTO blog (application_user_id, title, content, photo_id)
                      VALUES (@ApplicationUserId, @Title, @Content, @PhotoId)
                      RETURNING blog_id",
                    parameters);
            }

            return blogId.HasValue ? await GetAsync(blogId.Value) : null;
        }
    }
}
