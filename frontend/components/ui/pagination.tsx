"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { ButtonProps, buttonVariants } from "./button";
import { ChevronLeftIcon, ChevronRightIcon, Ellipsis } from "lucide-react";
import { LIMIT } from "@/constants";

interface PaginationProps extends Omit<
  React.HTMLProps<HTMLDivElement>,
  "onChange"
> {
  current: number;
  total: number;
  className?: string;
  classNames?: {
    content?: string;
    item?: string;
    prev?: string;
    next?: string;
    link?: string;
  };
  visible?: number;
  pageSize?: number;
  onChange?: (page: number) => void;
}

const Pagination = ({
  current,
  total,
  onChange,
  className,
  classNames,
  visible = 5,
  pageSize = LIMIT,
  ...props
}: PaginationProps) => {
  const totalPages = Math.ceil(total / pageSize);
  let startPage = current - Math.floor(visible / 2);
  let endPage = startPage + visible - 1;

  if (startPage <= 0) {
    endPage = visible;
    startPage = 1;
  }

  if (endPage > totalPages) {
    endPage = totalPages;
  }

  const startResult = (current - 1) * pageSize + 1;
  const endResult = Math.min(current * pageSize, total);
  return (
    <PaginationWrapper className={className} {...props}>
      <div className="flex justify-end items-center w-full">
        {Boolean(total) && (
          <span className="text-xs text-gray-500">
            Showing {startResult} to {endResult} of {total} results
          </span>
        )}
        <PaginationContent className={cn("ml-auto", classNames?.content)}>
          <PaginationItem className={classNames?.item}>
            <PaginationPrevious
              page={current - 1}
              disabled={current === 1}
              className={classNames?.prev}
              onPageChange={onChange}
            />
          </PaginationItem>
          {startPage > 1 && (
            <PaginationItem>
              <PaginationLink
                isActive={current === 1}
                page={1}
                className={classNames?.link}
                onPageChange={onChange}
              />
            </PaginationItem>
          )}
          {startPage > 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {Array.from({ length: endPage - startPage + 1 }).map((_, idx) => (
            <PaginationItem key={idx}>
              <PaginationLink
                key={idx}
                page={idx + startPage}
                isActive={current === idx + startPage}
                className={classNames?.link}
                onPageChange={onChange}
              />
            </PaginationItem>
          ))}
          {endPage < totalPages - 1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {endPage < totalPages && (
            <PaginationItem>
              <PaginationLink
                isActive={current === totalPages}
                page={totalPages}
                className={classNames?.link}
                onPageChange={onChange}
              />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationNext
              disabled={current >= totalPages}
              className={classNames?.next}
              page={current + 1}
              onPageChange={onChange}
            />
          </PaginationItem>
        </PaginationContent>
      </div>
    </PaginationWrapper>
  );
};
Pagination.displayName = "Pagination";

const PaginationWrapper = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
PaginationWrapper.displayName = "PaginationWrapper";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  page: number;
  isActive?: boolean;
  disabled?: boolean;
  type?: string;
  onPageChange?: (page: number) => void;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"div">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  page,
  disabled,
  onPageChange,
  type,
  children,
  ...props
}: PaginationLinkProps) => {
  return (
    <div
      onClick={(event) => {
        event.preventDefault();
        if (onPageChange && !disabled) onPageChange(page);
      }}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "cursor-pointer",
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    >
      {type ? children : page}
    </div>
  );
};
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { disabled?: boolean }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    type="navigation"
    className={cn(
      "gap-1 pl-2.5",
      className,
      props.disabled && "cursor-not-allowed opacity-50",
    )}
    {...props}
  >
    <ChevronLeftIcon className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { disabled?: boolean }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    type="navigation"
    className={cn(
      "gap-1 pr-2.5",
      className,
      props.disabled && "cursor-not-allowed opacity-50",
    )}
    {...props}
  >
    <span>Next</span>
    <ChevronRightIcon className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <Ellipsis className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export default Pagination;
export {
  PaginationWrapper,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
