"use client";
import { TablePagination } from "../table-pagination";
import { useUrlParams } from "../../../hooks/use-url-params";

export function PaginationWrapper({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const { setUrlParams } = useUrlParams();

  return (
    <TablePagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(newPage) => setUrlParams({ page: newPage.toString() })}
    />
  );
}
