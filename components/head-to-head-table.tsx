"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type { OpponentRecord } from "@/lib/types";

type SortKey = "opponent" | "played" | "wins" | "losses" | "ties" | "gf" | "ga";
type Direction = "asc" | "desc";

const columns: Array<{ key: SortKey; label: string; shortLabel?: string }> = [
  { key: "opponent", label: "Opponent" },
  { key: "played", label: "Games", shortLabel: "GP" },
  { key: "wins", label: "Wins", shortLabel: "W" },
  { key: "losses", label: "Losses", shortLabel: "L" },
  { key: "ties", label: "Draws", shortLabel: "D" },
  { key: "gf", label: "Goals For", shortLabel: "GF" },
  { key: "ga", label: "Goals Against", shortLabel: "GA" },
];

export function HeadToHeadTable({ records }: { records: OpponentRecord[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("opponent");
  const [direction, setDirection] = useState<Direction>("asc");

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const comparison = sortKey === "opponent"
        ? a.opponent.localeCompare(b.opponent)
        : a[sortKey] - b[sortKey];
      const ordered = direction === "asc" ? comparison : -comparison;
      return ordered || a.opponent.localeCompare(b.opponent);
    });
  }, [records, sortKey, direction]);

  function selectSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((current) => current === "desc" ? "asc" : "desc");
      return;
    }
    setSortKey(key);
    setDirection(key === "opponent" ? "asc" : "desc");
  }

  const cell = "border-b px-3 py-3 text-left tabular-nums";

  return (
    <>
      <div className="mb-5 sm:hidden">
        <div className="surface-card flex items-end gap-3 p-4">
          <label className="min-w-0 flex-1 text-sm font-bold" htmlFor="opponent-sort">
            Sort opponents
            <select
              id="opponent-sort"
              value={sortKey}
              onChange={(event) => selectSort(event.target.value as SortKey)}
              className="mt-2 min-h-11 w-full rounded-lg border bg-background px-3 text-sm font-semibold"
            >
              {columns.map((column) => <option key={column.key} value={column.key}>{column.label}</option>)}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setDirection((current) => current === "desc" ? "asc" : "desc")}
            className="action-secondary size-11 shrink-0 px-0"
            aria-label={`Sort ${direction === "asc" ? "descending" : "ascending"}`}
          >
            {direction === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:hidden">
        {sortedRecords.map((record) => (
          <article key={record.opponent} className="surface-card overflow-hidden">
            <div className="border-b bg-muted/30 px-5 py-4">
              <h2 className="text-xl font-black">{record.opponent}</h2>
            </div>
            <div className="grid grid-cols-3 divide-x px-2 py-5 text-center">
              <div className="px-2"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">W-L-D</p><p className="mt-1 text-xl font-black tabular-nums">{record.wins}-{record.losses}-{record.ties}</p></div>
              <div className="px-2"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Games</p><p className="mt-1 text-xl font-black tabular-nums">{record.played}</p></div>
              <div className="px-2"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">GF / GA</p><p className="mt-1 text-xl font-black tabular-nums">{record.gf} / {record.ga}</p></div>
            </div>
            <div className="px-4 pb-4">
              <Link className="action-secondary w-full" href={`/head-to-head/${record.slug}`}>View games <ArrowRight aria-hidden="true" /></Link>
            </div>
          </article>
        ))}
      </div>

      <div className="archive-table-wrap hidden sm:block">
      <table className="archive-table min-w-[760px]">
        <caption className="sr-only">All-time record against each documented opponent</caption>
        <thead className="bg-muted/60">
          <tr>
            {columns.map((column) => {
              const active = sortKey === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  className="border-b p-0 text-left"
                  aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
                >
                  <button
                    type="button"
                    onClick={() => selectSort(column.key)}
                    className="flex w-full items-center gap-2 px-3 py-4 font-bold transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    title={`Sort by ${column.label}`}
                  >
                    <span className="sm:hidden">{column.shortLabel ?? column.label}</span>
                    <span className="hidden sm:inline">{column.label}</span>
                    <span aria-hidden="true" className={active ? "text-primary" : "text-muted-foreground/50"}>
                      {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
                    </span>
                  </button>
                </th>
              );
            })}
            <th scope="col" className="border-b px-3 py-4"><span className="sr-only">Game history</span></th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((record) => (
            <tr key={record.opponent} className="odd:bg-background even:bg-muted/20 hover:bg-primary/5">
              <td className={`${cell} font-semibold`}>{record.opponent}</td>
              <td className={cell}>{record.played}</td>
              <td className={cell}>{record.wins}</td>
              <td className={cell}>{record.losses}</td>
              <td className={cell}>{record.ties}</td>
              <td className={cell}>{record.gf}</td>
              <td className={cell}>{record.ga}</td>
              <td className={`${cell} text-right`}>
                <Link className="text-link whitespace-nowrap" href={`/head-to-head/${record.slug}`}>
                  View games
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
