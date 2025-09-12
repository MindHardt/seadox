using System.Net;
using CoreApi.Features.Uploads.Actions;

namespace CoreApi.Tests;

public class MigratedFileNameTests
{
    private const string FileName = "image.png";
    private const string FileUrl = "http://localhost/" + FileName;
    
    [Theory]
    [InlineData("inline", FileName)]
    [InlineData("attachment", FileName)]
    [InlineData("attachment; filename=\"file name.jpg\"", "file name.jpg")]
    [InlineData("attachment; filename=_______.jpg; filename*=UTF-8''%D0%9C%D0%B0%D1%80%D1%83%D0%B2%D0%B8%D1%8F.jpg", "Марувия.jpg")]
    public void Test_Success(string contentDisposition, string fileName)
    {
        var res = new HttpResponseMessage(HttpStatusCode.OK)
        {
            RequestMessage = new HttpRequestMessage(HttpMethod.Get, FileUrl),
            Content = new ByteArrayContent([])
            {
                Headers =
                {
                    { "Content-Type", "image/png" },
                    { "Content-Disposition", contentDisposition }
                }
            }
        };
        
        Assert.Equal(fileName, MigrateUpload.GetFileName(res));
    }
}