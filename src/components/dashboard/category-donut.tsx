"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { SubscriptionCategory } from "@/config/app";
import { categoryColorVar } from "@/lib/subscriptions/categories";
import { formatCents } from "@/lib/subscriptions/format";
import type { CategoryDatum } from "@/lib/subscriptions/summary";

type Datum = { name: SubscriptionCategory; value: number; count: number };

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Datum }>;
}) {
  const first = payload?.[0];
  if (!active || !first) return null;
  const datum = first.payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium">{datum.name}</p>
      <p className="text-muted-foreground">
        {formatCents(datum.value)}/mo · {datum.count}{" "}
        {datum.count === 1 ? "tool" : "tools"}
      </p>
    </div>
  );
}

export function CategoryDonut({
  data,
  totalMonthlyCents,
}: {
  data: CategoryDatum[];
  totalMonthlyCents: number;
}) {
  const chartData: Datum[] = data.map((d) => ({
    name: d.category,
    value: d.monthlyCents,
    count: d.count,
  }));

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={94}
              paddingAngle={chartData.length > 1 ? 2 : 0}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={categoryColorVar(entry.name)} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-muted-foreground">per month</span>
          <span className="font-serif text-2xl font-semibold tabular-nums">
            {formatCents(totalMonthlyCents)}
          </span>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2.5">
        {chartData.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: categoryColorVar(entry.name) }}
              />
              {entry.name}
              <span className="text-muted-foreground">· {entry.count}</span>
            </span>
            <span className="font-medium tabular-nums">
              {formatCents(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
