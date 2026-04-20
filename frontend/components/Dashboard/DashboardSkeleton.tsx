import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded-md" />
        <div className="h-4 w-96 bg-muted rounded-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted rounded-md" />
              <div className="h-4 w-4 bg-muted rounded-md" />
            </CardHeader>

            <CardContent>
              <div className="h-8 w-20 bg-muted rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-5 w-40 bg-muted rounded-md" />
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />

                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded-md" />
                    <div className="h-3 w-40 bg-muted rounded-md" />
                  </div>
                </div>

                <div className="h-5 w-16 bg-muted rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-5 w-40 bg-muted rounded-md" />
          </CardHeader>

          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b pb-3 space-y-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />

                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded-md" />
                    <div className="h-3 w-24 bg-muted rounded-md" />
                  </div>
                </div>

                <div className="h-3 w-full bg-muted rounded-md" />
                <div className="h-3 w-3/4 bg-muted rounded-md" />

                <div className="flex gap-4">
                  <div className="h-3 w-10 bg-muted rounded-md" />
                  <div className="h-3 w-10 bg-muted rounded-md" />
                  <div className="h-3 w-10 bg-muted rounded-md" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
