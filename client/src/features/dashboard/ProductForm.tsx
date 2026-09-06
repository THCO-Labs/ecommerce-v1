import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { ProductInput } from "@/api/catalogue";
import type { AdminProduct, Category } from "@/types";

interface ProductFormProps {
  product: AdminProduct | null;
  categories: Category[];
  submitting: boolean;
  fieldErrors?: Record<string, string[]>;
  onSubmit: (input: ProductInput) => void;
  onCancel: () => void;
}

/** "Rustic Oak Shelf" -> "rustic-oak-shelf" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProductForm({
  product,
  categories,
  submitting,
  fieldErrors,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    setTitle(product?.title ?? "");
    setSlug(product?.slug ?? "");
    setSlugTouched(Boolean(product));
    setSummary(product?.summary ?? "");
    setDescription(product?.description ?? "");
    setImages((product?.images ?? []).join("\n"));
    setCategoryId(product?.category_id ?? "");
    setIsPublished(product?.is_published ?? true);
  }, [product]);

  // A new product's web address follows its title until someone edits it by
  // hand; an existing one never moves on its own, because links would break.
  function changeTitle(next: string) {
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim(),
      description: description.trim(),
      images: images
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      categoryId: categoryId || null,
      isPublished,
    });
  }

  return (
    <form data-builder-id="dashboard.product-form" onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(event) => changeTitle(event.target.value)} required />
          {fieldErrors?.title?.map((message) => (
            <p key={message} className="text-destructive text-xs">
              {message}
            </p>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Web address</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            required
          />
          {fieldErrors?.slug?.map((message) => (
            <p key={message} className="text-destructive text-xs">
              {message}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="summary">Card summary</Label>
        <Input
          id="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="One line shown on product cards"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="images">Image URLs</Label>
        <Textarea
          id="images"
          rows={3}
          value={images}
          onChange={(event) => setImages(event.target.value)}
          placeholder="One URL per line. The first is used on cards."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 pb-1">
          <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
          <Label htmlFor="isPublished">Visible in the shop</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
