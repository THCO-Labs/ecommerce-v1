import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi } from "@/api/orders";
import { useAsync } from "@/hooks/use-async";
import { MetricCards } from "@/features/dashboard/MetricCards";

export default function DashboardPage() {
  const { data, loading, error } = useAsync(() => ordersApi.metrics(), []);

  return (
    <div data-builder-id="dashboard.overview">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">A live view of the shop today.</p>

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-8 rounded-lg border p-4">{error}</p>
      )}

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <Card key={key}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-3 h-8 w-16" />
                </div>
                <Skeleton className="size-11 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        data && (
          <div className="mt-8">
            <MetricCards metrics={data} />
          </div>
        )
      )}
    </div>
  );
}
