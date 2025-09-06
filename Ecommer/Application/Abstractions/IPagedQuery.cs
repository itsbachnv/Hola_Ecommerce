namespace Ecommer.Application.Abstractions;

public interface IPagedQuery
{
    int Page { get; init; }
    int PageSize { get; init; }
}

public record PagedResult<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);