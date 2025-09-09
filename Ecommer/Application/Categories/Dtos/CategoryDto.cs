namespace Ecommer.Application.Categories.Dtos;

public record CategoryDto (
     long Id ,
     string Name,
     string Slug,
     long? ParentId,
     string? Path,
     DateTimeOffset ? CreatedAt ,
     DateTimeOffset ? UpdatedAt ,
     string? ParentName 
);