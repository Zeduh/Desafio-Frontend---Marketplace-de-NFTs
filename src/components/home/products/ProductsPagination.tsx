import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "../../ui/pagination";

interface ProductsPaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function ProductsPagination({
  currentPage,
  pageCount,
  onPageChange,
}: ProductsPaginationProps) {
  return (
    <Pagination
      aria-label="Paginação de produtos"
      className="products-pagination"
    >
      <PaginationContent className="products-pagination__list">
        {currentPage > 1 ? (
          <PaginationItem>
            <Button
              aria-label="Página anterior"
              className="products-pagination__previous"
              onClick={() => onPageChange(currentPage - 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ArrowLeft aria-hidden="true" size={18} />
            </Button>
          </PaginationItem>
        ) : (
          <PaginationItem aria-hidden="true" className="products-pagination__placeholder" />
        )}
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <PaginationItem key={page}>
            <Button
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Página ${page}`}
              className={page === currentPage ? "products-pagination__current" : ""}
              onClick={() => onPageChange(page)}
              size="icon"
              type="button"
              variant="outline"
            >
              {page}
            </Button>
          </PaginationItem>
        ))}
        {currentPage < pageCount ? (
          <PaginationItem>
            <Button
              aria-label="Próxima página"
              className="products-pagination__next"
              onClick={() => onPageChange(currentPage + 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ArrowRight aria-hidden="true" size={18} />
            </Button>
          </PaginationItem>
        ) : (
          <PaginationItem aria-hidden="true" className="products-pagination__placeholder" />
        )}
      </PaginationContent>
    </Pagination>
  );
}
