using Ecommer.Domain;

namespace Ecommer.Application.Categories.Dtos;

public static class CategoryMapping
{
    public static CategoryDto ToDto(this Category c) =>
        new(c.Id, c.Name, c.Slug, c.ParentId ?? null, c.Path, c.CreatedAt, c.UpdatedAt, c.Parent?.Name ?? null);
}