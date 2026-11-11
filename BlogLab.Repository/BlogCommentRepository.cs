using BlogLab.Models.BlogComment;
using Dapper;
using Npgsql;

namespace BlogLab.Repository
{
    public class BlogCommentRepository : IBlogCommentRepository
    {
        private const string CommentColumns =
            "blog_comment_id, parent_blog_comment_id, blog_id, application_user_id, username, content, publish_date, update_date";

        private readonly NpgsqlDataSource _dataSource;

        public BlogCommentRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<int> DeleteAsync(int blogCommentId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            // deletes the comment together with all replies under it
            return await connection.ExecuteAsync(
                @"WITH RECURSIVE tree AS (
                      SELECT blog_comment_id FROM blog_comment WHERE blog_comment_id = @BlogCommentId
                      UNION ALL
                      SELECT c.blog_comment_id FROM blog_comment c
                      JOIN tree t ON c.parent_blog_comment_id = t.blog_comment_id
                  )
                  UPDATE blog_comment
                  SET active_ind = FALSE, update_date = now()
                  WHERE blog_comment_id IN (SELECT blog_comment_id FROM tree)",
                new { BlogCommentId = blogCommentId });
        }

        public async Task<List<BlogComment>> GetAllAsync(int blogId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            var comments = await connection.QueryAsync<BlogComment>(
                $@"SELECT {CommentColumns} FROM blog_comment_view
                   WHERE blog_id = @BlogId AND active_ind
                   ORDER BY update_date DESC",
                new { BlogId = blogId });

            return comments.ToList();
        }

        public async Task<BlogComment> GetAsync(int blogCommentId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            return await connection.QueryFirstOrDefaultAsync<BlogComment>(
                $"SELECT {CommentColumns} FROM blog_comment_view WHERE blog_comment_id = @BlogCommentId AND active_ind",
                new { BlogCommentId = blogCommentId });
        }

        public async Task<BlogComment> UpsertAsync(BlogCommentCreate blogCommentCreate, int applicationUserId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            var parameters = new
            {
                blogCommentCreate.BlogCommentId,
                blogCommentCreate.ParentBlogCommentId,
                blogCommentCreate.BlogId,
                blogCommentCreate.Content,
                ApplicationUserId = applicationUserId
            };

            int? commentId;

            if (blogCommentCreate.BlogCommentId > 0)
            {
                // only the author can edit a comment
                commentId = await connection.ExecuteScalarAsync<int?>(
                    @"UPDATE blog_comment
                      SET content = @Content, update_date = now()
                      WHERE blog_comment_id = @BlogCommentId AND application_user_id = @ApplicationUserId AND active_ind
                      RETURNING blog_comment_id",
                    parameters);
            }
            else
            {
                commentId = await connection.ExecuteScalarAsync<int>(
                    @"INSERT INTO blog_comment (parent_blog_comment_id, blog_id, application_user_id, content)
                      VALUES (@ParentBlogCommentId, @BlogId, @ApplicationUserId, @Content)
                      RETURNING blog_comment_id",
                    parameters);
            }

            return commentId.HasValue ? await GetAsync(commentId.Value) : null;
        }
    }
}
