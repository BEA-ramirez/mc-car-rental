import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

export function ClientsDataGridSkeleton() {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-slate-50/90 backdrop-blur-sm shadow-[0_1px_0_0_#e2e8f0] z-10">
        <TableRow className="border-none">
          <TableHead className="w-10 text-center px-0">
            <Checkbox disabled className="rounded-[3px]" />
          </TableHead>
          <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Client
          </TableHead>
          <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Contact Info
          </TableHead>
          <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Role
          </TableHead>
          <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Status
          </TableHead>
          <TableHead className="h-9 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Last Active
          </TableHead>
          <TableHead className="h-9 text-right pr-6"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Render 10 fake loading rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRow key={i} className="border-b border-slate-100">
            <TableCell className="w-10 text-center px-0 align-middle">
              <Checkbox disabled className="rounded-[3px]" />
            </TableCell>

            {/* Client Avatar & Name Skeleton */}
            <TableCell className="py-3 align-middle">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-sm" />
              </div>
            </TableCell>

            {/* Contact Info Skeleton */}
            <TableCell className="py-3 align-middle">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-32 rounded-sm" />
                <Skeleton className="h-3 w-20 rounded-sm" />
              </div>
            </TableCell>

            {/* Role Skeleton */}
            <TableCell className="py-3 align-middle">
              <Skeleton className="h-5 w-16 rounded-sm" />
            </TableCell>

            {/* Status Skeleton */}
            <TableCell className="py-3 align-middle">
              <Skeleton className="h-5 w-14 rounded-sm" />
            </TableCell>

            {/* Last Active Skeleton */}
            <TableCell className="py-3 align-middle">
              <Skeleton className="h-3 w-20 rounded-sm" />
            </TableCell>

            {/* Actions Skeleton */}
            <TableCell className="py-3 align-middle text-right pr-4">
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-6 w-6 rounded-sm" />
                <Skeleton className="h-6 w-6 rounded-sm" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ClientOverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
      {/* Stat 1 */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
          <Skeleton className="h-4 w-30 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-18 rounded-sm" />
        </div>
      </div>

      {/* Stat 2 */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
          <Skeleton className="h-4 w-30 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-18 rounded-sm" />
        </div>
      </div>

      {/* Stat 3 */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
          <Skeleton className="h-4 w-30 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-18 rounded-sm" />
        </div>
      </div>

      {/* Stat 4 */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
          <Skeleton className="h-4 w-30 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-18 rounded-sm" />
        </div>
      </div>

      {/* Stat 5 */}
      <div className="p-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-1.5 text-slate-500 mb-3">
          <Skeleton className="h-4 w-30 rounded-sm" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-6 w-18 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="bg-[#111623]/80 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image Area Skeleton - Darkened */}
      <div className="relative h-44 w-full bg-[#050608] flex items-center justify-center border-b border-white/5">
        <Skeleton className="w-full h-full bg-white/[0.03] rounded-none" />
        {/* Compact Year badge skeleton */}
        <Skeleton className="absolute top-3 left-3 w-10 h-4 bg-white/5 rounded-sm" />
      </div>

      {/* Content Area Skeleton */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-4 space-y-2">
          {/* Brand skeleton */}
          <Skeleton className="w-12 h-2 bg-blue-500/10 rounded-none" />
          {/* Model skeleton */}
          <Skeleton className="w-32 h-5 bg-white/5 rounded-none" />
        </div>

        {/* Specs Row Skeletons */}
        <div className="grid grid-cols-3 gap-1.5 mb-5 mt-auto">
          <Skeleton className="h-10 bg-white/[0.02] border border-white/5 rounded-sm" />
          <Skeleton className="h-10 bg-white/[0.02] border border-white/5 rounded-sm" />
          <Skeleton className="h-10 bg-white/[0.02] border border-white/5 rounded-sm" />
        </div>

        {/* Footer Skeleton */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
          <div className="space-y-1.5">
            {/* Rate label skeleton */}
            <Skeleton className="w-10 h-2 bg-white/5 rounded-none" />
            {/* Price skeleton */}
            <Skeleton className="w-20 h-5 bg-white/10 rounded-none" />
          </div>
          {/* Button skeleton */}
          <Skeleton className="w-20 h-9 bg-white/20 rounded-none" />
        </div>
      </div>
    </div>
  );
}
