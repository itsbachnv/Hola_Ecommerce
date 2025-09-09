using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Ecommer.Application.Abstractions.Cloudary;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration config)
    {
        var account = new Account(
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );

        _cloudinary = new Cloudinary(account);
        _cloudinary.Api.Secure = true;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string folder = "product-images")
    {
        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder,
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
            throw new Exception($"Image upload failed: {uploadResult.Error.Message}");

        return uploadResult.SecureUrl.ToString();
    }
    
    public async Task<bool> DeleteImageAsync(string publicId)
    {
        var deletionParams = new DeletionParams(publicId);
        var deletionResult = await _cloudinary.DestroyAsync(deletionParams);

        return deletionResult.Result == "ok";
    }
}