"use client";

import {
  Table as ShadcnTable,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
  TableCaption,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type ColumnType<T> = {
  key: string;
  title: React.ReactNode;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  className?: string;
};

export type TableProps<T> = {
  columns: ColumnType<T>[];
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  className?: string;
  classNames?: {
    header?: string;
    row?: string;
    cell?: string;
    body?: string;
  };
  caption?: React.ReactNode;
  footer?: React.ReactNode;
  onRow?: (
    record: T,
    index: number,
  ) => React.HTMLAttributes<HTMLTableRowElement>;
  loading?: boolean;
};

export function CustomTable<T extends Record<string, any>>({
  columns = [],
  dataSource = [],
  rowKey = "id",
  className,
  classNames = {},
  caption,
  footer,
  onRow,
  loading = false,
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    return record[rowKey] ? String(record[rowKey]) : String(index);
  };

  return (
    <ShadcnTable className={className}>
      {caption && <TableCaption>{caption}</TableCaption>}

      <TableHeader className={classNames.header}>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={column.className}
              style={column.width ? { width: column.width } : undefined}
            >
              {column.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody className={classNames.body}>
        {loading ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              <div className="flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2">Loading...</span>
              </div>
            </TableCell>
          </TableRow>
        ) : dataSource.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No data available
            </TableCell>
          </TableRow>
        ) : (
          dataSource.map((record, index) => (
            <TableRow
              key={getRowKey(record, index)}
              className={classNames.row}
              {...(onRow ? onRow(record, index) : {})}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(classNames.cell, column.className)}
                >
                  {column.render
                    ? column.render(
                        column.dataIndex ? record[column.dataIndex] : record,
                        record,
                        index,
                      )
                    : column.dataIndex
                      ? record[column.dataIndex]
                      : null}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>

      {footer && <TableFooter>{footer}</TableFooter>}
    </ShadcnTable>
  );
}
