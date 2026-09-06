import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoriesApi, productsApi, type ProductInput } from "@/api/catalogue";
import { ApiError } from "@/api/client";
import { useAsync } from "@/hooks/use-async";
import { ProductForm } from "@/features/dashboard/ProductForm";
import { VariantEditor } from "@/features/dashboard/VariantEditor";
import type { AdminProduct } from "@/types";

export default function ProductsPage() {
  const { data: products, loading, error, reload } = useAsync(() => productsApi.listAll(), []);
  const { data: categories } = useAsync(() => categoriesApi.list(), []);

  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [variantsFor, setVariantsFor] = useState<AdminProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>();

  async function save(input: ProductInput) {
    setSubmitting(true);
    setFieldErrors(undefined);
    try {
      if (editing) await productsApi.update(editing.id, input);
      else await productsApi.create(input);
      toast.success(editing ? "Product updated" : "Product created");
      setEditing(null);
      setCreating(false);
      reload();
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors(cause.fieldErrors);
        toast.error(cause.message);
      } else {
        toast.error("Could not save that product");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(product: AdminProduct) {
    // Deleting a product cascades to its variants, and any order that included
    // them keeps its snapshot rows — the receipt survives the catalogue.
    if (!window.confirm(`Delete “${product.title}”? Its variants go too. Past orders keep their record.`)) return;
    try {
      await productsApi.remove(product.id);
      toast.success("Product deleted");
      reload();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not delete that product");
    }
  }

  return (
    <div data-builder-id="dashboard.products">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Products</h1>
          <p className="text-muted-foreground mt-2">
            The catalogue and its prices. Only administrators can change these.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          New product
        </Button>
      </div>

      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-8 rounded-lg border p-4">{error}</p>
      )}

      {loading ? (
        <Skeleton className="mt-8 h-72 w-full rounded-xl" />
      ) : (
        <Card className="mt-8">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Variants</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-muted-foreground tabular text-xs">/{product.slug}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {product.categoryName ?? "—"}
                    </TableCell>
                    <TableCell className="tabular text-right">
                      <Button variant="link" className="h-auto p-0" onClick={() => setVariantsFor(product)}>
                        {product.variantCount}
                      </Button>
                    </TableCell>
                    <TableCell className="tabular text-right">{product.totalStock}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_published ? "outline" : "secondary"}>
                        {product.is_published ? "Live" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${product.title}`}
                          onClick={() => setEditing(product)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${product.title}`}
                          onClick={() => void remove(product)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {products?.length === 0 && (
              <p className="text-muted-foreground p-8 text-center">
                No products yet. Create one to open the shop.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false);
            setEditing(null);
            setFieldErrors(undefined);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            <DialogDescription>
              Prices live on variants, which you add after the product exists.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editing}
            categories={categories ?? []}
            submitting={submitting}
            fieldErrors={fieldErrors}
            onSubmit={save}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={variantsFor !== null} onOpenChange={(open) => !open && setVariantsFor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{variantsFor?.title}</DialogTitle>
            <DialogDescription>Sizes, options and prices for this product.</DialogDescription>
          </DialogHeader>
          {variantsFor && <VariantEditor product={variantsFor} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
