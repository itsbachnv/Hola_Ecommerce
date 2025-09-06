import Button from "./Button";
export function LoadingButton({ loading, children, ...rest }: any) {
  return (
    <Button disabled={loading} {...rest}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
          Loading...
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
