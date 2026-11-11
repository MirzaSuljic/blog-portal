using System.Text.Json;

namespace BlogLab.Models.Exception
{
    public class ApiException
    {
        public int StatusCode { get; set; }

        public string Message { get; set; }

        public override string ToString()
        {
            return JsonSerializer.Serialize(this, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        }
    }
}
