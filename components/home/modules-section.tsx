import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { modules } from "./content";

export function ModulesSection() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {modules.map((module) => {
        const Icon = module.icon;

        return (
          <Card key={module.title}>
            <Icon
              className="mb-5 h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <CardTitle>{module.title}</CardTitle>
            <CardDescription className="mt-2">
              {module.description}
            </CardDescription>
          </Card>
        );
      })}
    </section>
  );
}
