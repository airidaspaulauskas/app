"use client";

import * as React from "react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { LAST_USED_OPTIONS, type LastUsedValue } from "@/config/app";
import { categoryColorVar } from "@/lib/subscriptions/categories";
import { formatCents, formatMonthly, monthlyCents } from "@/lib/subscriptions/format";
import { cn } from "@/lib/utils";
import type { SubscriptionRow } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteSubscriptionDialog } from "./delete-subscription-dialog";
import { SubscriptionFormDialog } from "./subscription-form-dialog";

type SortKey = "name" | "category" | "monthly" | "renewal" | "lastUsed";
type SortDir = "asc" | "desc";

const LAST_USED_LABEL = new Map<LastUsedValue, string>(
  LAST_USED_OPTIONS.map((option) => [option.value, option.label]),
);
const LAST_USED_RANK: Record<LastUsedValue, number> = {
  today: 0,
  week: 1,
  month: 2,
  unknown: 3,
};

function compare(a: SubscriptionRow, b: SubscriptionRow, key: SortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "category":
      return a.category.localeCompare(b.category);
    case "monthly":
      return monthlyCents(a) - monthlyCents(b);
    case "lastUsed":
      return LAST_USED_RANK[a.last_used] - LAST_USED_RANK[b.last_used];
    case "renewal": {
      // Missing renewal dates always sort last.
      const av = a.renewal_date ?? "9999-99-99";
      const bv = b.renewal_date ?? "9999-99-99";
      return av.localeCompare(bv);
    }
  }
}

function RenewalCell({ date }: { date: string | null }) {
  if (!date) return <span className="text-muted-foreground">—</span>;

  const days = differenceInCalendarDays(parseISO(date), new Date());
  const formatted = format(parseISO(date), "MMM d, yyyy");
  const soon = days >= 0 && days <= 7;

  let relative: string | null = null;
  if (days < 0) relative = "overdue";
  else if (days === 0) relative = "today";
  else if (days === 1) relative = "tomorrow";
  else if (days <= 30) relative = `in ${days} days`;

  return (
    <div className="flex flex-col">
      <span>{formatted}</span>
      {relative && (
        <span
          className={cn(
            "text-xs",
            soon ? "font-medium text-brand" : "text-muted-foreground",
          )}
        >
          {relative}
        </span>
      )}
    </div>
  );
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  column: SortKey;
  sort: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === column;
  return (
    <TableHead
      aria-sort={
        active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"
      }
      className={align === "right" ? "text-right" : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1 rounded text-sm font-medium transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        {active ? (
          sort.dir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}

export function SubscriptionsTable({
  subscriptions,
}: {
  subscriptions: SubscriptionRow[];
}) {
  const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({
    key: "monthly",
    dir: "desc",
  });
  const [editing, setEditing] = React.useState<SubscriptionRow | null>(null);
  const [deleting, setDeleting] = React.useState<SubscriptionRow | null>(null);

  function onSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "monthly" ? "desc" : "asc" },
    );
  }

  const sorted = React.useMemo(() => {
    const copy = [...subscriptions];
    copy.sort((a, b) => {
      const result = compare(a, b, sort.key);
      return sort.dir === "asc" ? result : -result;
    });
    return copy;
  }, [subscriptions, sort]);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader label="Name" column="name" sort={sort} onSort={onSort} />
            <SortHeader
              label="Category"
              column="category"
              sort={sort}
              onSort={onSort}
            />
            <SortHeader
              label="Cost"
              column="monthly"
              sort={sort}
              onSort={onSort}
              align="right"
            />
            <SortHeader
              label="Renewal"
              column="renewal"
              sort={sort}
              onSort={onSort}
            />
            <SortHeader
              label="Last used"
              column="lastUsed"
              sort={sort}
              onSort={onSort}
            />
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-medium">{sub.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: categoryColorVar(sub.category) }}
                  />
                  {sub.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <div className="font-medium">
                  {formatMonthly(monthlyCents(sub))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sub.billing_cycle === "annual"
                    ? `${formatCents(sub.cost_cents)} billed yearly`
                    : "billed monthly"}
                </div>
              </TableCell>
              <TableCell>
                <RenewalCell date={sub.renewal_date} />
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    sub.last_used === "unknown" && "text-muted-foreground",
                  )}
                >
                  {LAST_USED_LABEL.get(sub.last_used)}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Actions for ${sub.name}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => setEditing(sub)}
                    >
                      <Pencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onSelect={() => setDeleting(sub)}
                    >
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SubscriptionFormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        subscription={editing ?? undefined}
      />
      <DeleteSubscriptionDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        subscription={deleting}
      />
    </>
  );
}
