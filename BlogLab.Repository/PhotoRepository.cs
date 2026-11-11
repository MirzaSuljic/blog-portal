using BlogLab.Models.Photo;
using Dapper;
using Npgsql;

namespace BlogLab.Repository
{
    public class PhotoRepository : IPhotoRepository
    {
        private const string PhotoColumns =
            "photo_id, application_user_id, public_id, image_url, description, publish_date, update_date";

        private readonly NpgsqlDataSource _dataSource;

        public PhotoRepository(NpgsqlDataSource dataSource)
        {
            _dataSource = dataSource;
        }

        public async Task<int> DeletetAsync(int photoId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            return await connection.ExecuteAsync(
                "DELETE FROM photo WHERE photo_id = @PhotoId",
                new { PhotoId = photoId });
        }

        public async Task<List<Photo>> GetAllByUserIdAsync(int applicationUserId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            var photos = await connection.QueryAsync<Photo>(
                $"SELECT {PhotoColumns} FROM photo WHERE application_user_id = @ApplicationUserId ORDER BY photo_id DESC",
                new { ApplicationUserId = applicationUserId });

            return photos.ToList();
        }

        public async Task<Photo> GetAsync(int photoId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            return await connection.QueryFirstOrDefaultAsync<Photo>(
                $"SELECT {PhotoColumns} FROM photo WHERE photo_id = @PhotoId",
                new { PhotoId = photoId });
        }

        public async Task<Photo> InsertAsync(PhotoCreate photoCreate, int applicationUserId)
        {
            await using var connection = await _dataSource.OpenConnectionAsync();

            var photoId = await connection.ExecuteScalarAsync<int>(
                @"INSERT INTO photo (application_user_id, public_id, image_url, description)
                  VALUES (@ApplicationUserId, @PublicId, @ImageUrl, @Description)
                  RETURNING photo_id",
                new
                {
                    ApplicationUserId = applicationUserId,
                    photoCreate.PublicId,
                    photoCreate.ImageUrl,
                    photoCreate.Description
                });

            return await GetAsync(photoId);
        }
    }
}
