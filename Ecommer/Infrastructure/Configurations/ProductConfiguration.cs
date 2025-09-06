using Ecommer.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Ecommer.Infrastructure.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> e)
    {
        e.ToTable("products");
        e.HasKey(x => x.Id);
        e.Property(x => x.Name).IsRequired();
        e.Property(x => x.Slug).IsRequired();
        e.Property(x => x.Status).HasDefaultValue("Active");
        e.HasIndex(x => x.Slug).IsUnique();
        e.HasIndex(x => x.BrandId);
        e.HasIndex(x => x.CategoryId);
    }
}