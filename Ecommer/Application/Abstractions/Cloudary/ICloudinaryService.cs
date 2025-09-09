namespace Ecommer.Application.Abstractions.Cloudary;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFormFile file, string folder = "product-images");
    Task<bool> DeleteImageAsync(string publicId);
}