import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

interface MobileFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function MobileFiltersDialog({
  open,
  onOpenChange,
  children,
}: MobileFiltersDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="products-dialog gap-0"
        overlayClassName="products-dialog-overlay"
        showCloseButton={false}
      >
        <DialogHeader className="products-dialog__heading gap-0">
          <DialogTitle>Filtros de produtos</DialogTitle>
          <DialogDescription>
            Refine os NFTs por coleção, faixa de preço ou rede.
          </DialogDescription>
          <DialogClose
            render={
              <Button
                aria-label="Fechar filtros"
                className="products-dialog__close"
                size="icon"
                type="button"
                variant="ghost"
              />
            }
          >
            <X aria-hidden="true" size={18} />
          </DialogClose>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
