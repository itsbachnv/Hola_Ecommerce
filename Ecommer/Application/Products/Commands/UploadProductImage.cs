using Ecommer.Application.Abstractions;
using Ecommer.Application.Abstractions.Cloudary;
using Ecommer.Application.Abstractions.Products;
using MediatR;

namespace Ecommer.Application.Products.Commands;

public record UploadProductImageCommand(long ProductId, bool isPrimary, IFormFile File) : IRequest<string>;

public class UploadProductImageHandler : IRequestHandler<UploadProductImageCommand, string>
{
    private readonly IProductRepository _repo;
    private readonly ICloudinaryService _cloudinary;

    public UploadProductImageHandler(IProductRepository repo, ICloudinaryService cloudinary)
    {
        _repo = repo;
        _cloudinary = cloudinary;
    }

    public async Task<string> Handle(UploadProductImageCommand request, CancellationToken ct)
    {
        var imageUrl = await _cloudinary.UploadImageAsync(request.File, "product-images");
        return await _repo.UploadImageAsync(request.ProductId, request.File, request.isPrimary, ct);
    }
}