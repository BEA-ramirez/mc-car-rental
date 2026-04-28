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
    <div className="bg-[#0a1118] rounded-xl sm:rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full animate-pulse shadow-lg">
      {/* Image Area Skeleton - Increased to h-40/h-52 to match the new card */}
      <div className="relative h-40 sm:h-52 w-full bg-[#050608] flex items-center justify-center shrink-0">
        <Skeleton className="w-full h-full bg-white/[0.03] rounded-none" />

        {/* Compact Year badge skeleton */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-12 h-5 bg-white/5 rounded-full" />
      </div>

      {/* Content Area Skeleton */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 relative z-10 -mt-6 sm:-mt-8">
        {/* Header Skeletons */}
        <div className="mb-2 sm:mb-4 flex items-baseline gap-1.5 sm:gap-2 overflow-hidden">
          {/* Brand skeleton */}
          <Skeleton className="w-12 h-3 sm:h-3.5 bg-[#64c5c3]/10 rounded flex-shrink-0" />
          {/* Model skeleton */}
          <Skeleton className="w-24 sm:w-32 h-4 sm:h-5 bg-white/10 rounded" />
        </div>

        {/* Specs Row Skeletons (Hidden on Mobile, just like the real card) */}
        <div className="hidden sm:grid grid-cols-3 gap-2 mb-5 mt-auto">
          <Skeleton className="h-[46px] bg-white/[0.02] border border-white/5 rounded-lg" />
          <Skeleton className="h-[46px] bg-white/[0.02] border border-white/5 rounded-lg" />
          <Skeleton className="h-[46px] bg-white/[0.02] border border-white/5 rounded-lg" />
        </div>

        {/* Spacer to push footer down on mobile when specs are hidden */}
        <div className="flex-1 sm:hidden" />

        {/* Footer: Price & Action Skeleton */}
        <div className="pt-3 sm:pt-4 border-t border-white/5 flex items-end justify-between gap-2 mt-auto">
          {/* Rates Container Skeleton */}
          <div className="flex flex-col gap-1.5 w-1/2">
            {/* 24h Rate Skeleton */}
            <div className="flex items-baseline gap-1.5">
              <Skeleton className="w-16 sm:w-20 h-4 sm:h-5 bg-white/10 rounded-md" />
              <Skeleton className="w-6 sm:w-8 h-2 sm:h-2.5 bg-white/5 rounded-sm" />
            </div>

            {/* 12h Rate Skeleton (optional double stack look) */}
            <div className="flex items-baseline gap-1.5">
              <Skeleton className="w-12 sm:w-16 h-3 sm:h-4 bg-white/5 rounded-md" />
              <Skeleton className="w-6 sm:w-8 h-2 sm:h-2 bg-white/[0.02] rounded-sm" />
            </div>
          </div>

          {/* Button skeleton */}
          <Skeleton className="w-10 sm:w-20 h-8 sm:h-10 bg-white/5 rounded-lg shrink-0" />
        </div>
      </div>
    </div>
  );
}
