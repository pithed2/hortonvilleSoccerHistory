"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
    <div className="archive-table-wrap">
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
  );
}
