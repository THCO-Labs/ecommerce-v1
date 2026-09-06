import { hash } from "bcryptjs";
import { db } from "./index.js";
import { categories, products, users, variants } from "./schema.js";

/**
 * Demo data.
 *
 * Every row carries a fixed uuid derived from its position, and every insert
 * uses `onConflictDoNothing`, so `npm run db:seed` is safe to run twice — which
 * matters because the platform runs it once per project and a developer will
 * run it again by hand.
 */

/**
 * Demo photography, hotlinked from Unsplash under its licence.
 *
 * Every one of these was checked against the product it illustrates by
 * rendering the whole set and looking at it — an earlier pass used photo IDs
 * chosen by guesswork and shipped a watermelon for wildflower honey. If you
 * change one, verify it the same way: a plausible-looking id is not evidence.
 *
 * The client falls back to a local placeholder when an image cannot be
 * fetched, so a sandbox with restricted egress still renders a composed page.
 */
const IMAGE = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

interface SeedCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  position: number;
}

const categoryRows: SeedCategory[] = [
  {
    id: "c0000000-0000-4000-8000-000000000001",
    slug: "home-kitchen",
    name: "Home & Kitchen",
    description: "Things that earn their place on the counter.",
    position: 1,
  },
  {
    id: "c0000000-0000-4000-8000-000000000002",
    slug: "outdoor",
    name: "Outdoor",
    description: "For the garden, the balcony, and the walk in between.",
    position: 2,
  },
  {
    id: "c0000000-0000-4000-8000-000000000003",
    slug: "stationery",
    name: "Stationery",
    description: "Paper worth writing on and pens worth keeping.",
    position: 3,
  },
  {
    id: "c0000000-0000-4000-8000-000000000004",
    slug: "pantry",
    name: "Pantry",
    description: "Small-batch staples from people we actually know.",
    position: 4,
  },
];

interface SeedProduct {
  slug: string;
  title: string;
  summary: string;
  description: string;
  images: string[];
  categoryIndex: number;
  variants: Array<{ name: string; price: number; stock: number }>;
}

const productRows: SeedProduct[] = [
  {
    slug: "stoneware-mug",
    title: "Stoneware Mug",
    summary: "Heavy in the hand, keeps tea hot to the last mouthful.",
    description:
      "Thrown from speckled stoneware and glazed on the inside only, so the outside keeps its matte grip. Dishwasher safe, though it will thank you for a wash by hand.",
    images: [IMAGE("1616241673111-508b4662c707")],
    categoryIndex: 0,
    variants: [
      { name: "Ash", price: 18, stock: 40 },
      { name: "Clay", price: 18, stock: 12 },
      { name: "Charcoal", price: 19.5, stock: 3 },
    ],
  },
  {
    slug: "cast-iron-skillet",
    title: "Cast Iron Skillet",
    summary: "Pre-seasoned, oven safe, and effectively immortal.",
    description:
      "A 26cm skillet that goes from hob to oven without complaint. Arrives pre-seasoned; keep it dry and it will outlast the kitchen it lives in.",
    images: [IMAGE("1579805625996-db7b60587362")],
    categoryIndex: 0,
    variants: [
      { name: "26cm", price: 42, stock: 18 },
      { name: "30cm", price: 54, stock: 6 },
    ],
  },
  {
    slug: "linen-tea-towels",
    title: "Linen Tea Towels",
    summary: "Set of three, softer with every wash.",
    description:
      "European flax, stonewashed so they are useful on the first day rather than the tenth. Sold in threes because one is never enough.",
    images: [IMAGE("1596433904500-97b901c5d274")],
    categoryIndex: 0,
    variants: [{ name: "Set of 3", price: 24, stock: 30 }],
  },
  {
    slug: "enamel-camp-kettle",
    title: "Enamel Camp Kettle",
    summary: "One litre, open flame welcome.",
    description:
      "Steel core under a chip-resistant enamel coat. Happy on a camp stove, a fire pit, or a hob when the power is out.",
    images: [IMAGE("1639428133787-b580d8c27f96")],
    categoryIndex: 1,
    variants: [
      { name: "Cream", price: 32, stock: 14 },
      { name: "Forest", price: 32, stock: 0 },
    ],
  },
  {
    slug: "waxed-canvas-tote",
    title: "Waxed Canvas Tote",
    summary: "Rain runs off it. So does most of a market shop.",
    description:
      "Waxed cotton canvas with leather handles and a flat base that stands up on its own. Re-wax it once a year and it will keep going.",
    images: [IMAGE("1574365569389-a10d488ca3fb")],
    categoryIndex: 1,
    variants: [
      { name: "Olive", price: 68, stock: 9 },
      { name: "Tan", price: 68, stock: 2 },
    ],
  },
  {
    slug: "terracotta-planter",
    title: "Terracotta Planter",
    summary: "Unglazed, so roots can breathe.",
    description:
      "Fired terracotta with a drainage hole and a matching saucer. Unglazed on purpose: the clay wicks moisture and keeps roots from sitting wet.",
    images: [IMAGE("1528789386055-75c4b717bad1")],
    categoryIndex: 1,
    variants: [
      { name: "Small", price: 14, stock: 50 },
      { name: "Medium", price: 22, stock: 25 },
      { name: "Large", price: 34, stock: 4 },
    ],
  },
  {
    slug: "hardback-notebook",
    title: "Hardback Notebook",
    summary: "Lies flat. Ink does not bleed through.",
    description:
      "160 pages of 100gsm paper, section sewn so it opens flat on a desk. Dot grid inside, cloth spine outside.",
    images: [IMAGE("1501618669935-18b6ecb13d6d")],
    categoryIndex: 2,
    variants: [
      { name: "Dot grid", price: 16, stock: 60 },
      { name: "Ruled", price: 16, stock: 45 },
      { name: "Plain", price: 16, stock: 5 },
    ],
  },
  {
    slug: "brass-fountain-pen",
    title: "Brass Fountain Pen",
    summary: "Ages into a patina you did not have to fake.",
    description:
      "Solid brass barrel with a steel medium nib, cartridge or converter. It will darken where your fingers sit, which is the point.",
    images: [IMAGE("1471107340929-a87cd0f5b5f3")],
    categoryIndex: 2,
    variants: [{ name: "Medium nib", price: 46, stock: 11 }],
  },
  {
    slug: "wildflower-seed-paper",
    title: "Wildflower Seed Cards",
    summary: "Write on them, then plant them.",
    description:
      "Handmade paper embedded with a native wildflower mix. Pack of six with envelopes. Soak, sow shallow, keep damp.",
    images: [IMAGE("1470240731273-7821a6eeb6bd")],
    categoryIndex: 2,
    variants: [{ name: "Pack of 6", price: 12, stock: 80 }],
  },
  {
    slug: "single-origin-coffee",
    title: "Single Origin Coffee",
    summary: "Roasted the Monday before it ships.",
    description:
      "Washed Ethiopian, roasted light enough to keep the citrus. Whole bean, 250g, with the roast date stamped on the base rather than a best-before a year out.",
    images: [IMAGE("1524350876685-274059332603")],
    categoryIndex: 3,
    variants: [
      { name: "250g whole bean", price: 11.5, stock: 36 },
      { name: "1kg whole bean", price: 38, stock: 8 },
    ],
  },
  {
    slug: "wildflower-honey",
    title: "Wildflower Honey",
    summary: "Raw, unfiltered, from three counties over.",
    description:
      "Cold extracted and never pasteurised, so it will crystallise in the jar. Warm it gently in water if you would rather it ran.",
    images: [IMAGE("1587049352851-8d4e89133924")],
    categoryIndex: 3,
    variants: [
      { name: "340g", price: 9, stock: 42 },
      { name: "900g", price: 21, stock: 1 },
    ],
  },
  {
    slug: "sourdough-crackers",
    title: "Sourdough Crackers",
    summary: "Made from the starter discard, salted well.",
    description:
      "Thin, blistered and properly salty. Baked in small trays from a twelve-year-old starter, which is why no two boxes look the same.",
    images: [IMAGE("1761486691762-d6047aef5edf")],
    categoryIndex: 3,
    variants: [{ name: "180g box", price: 6.5, stock: 0 }],
  },
];

/**
 * Fixed ids derived from position keep demo links stable across resets.
 *
 * The leading character must be a hex digit. An earlier version used "u", "p"
 * and "v" as readable prefixes for users, products and variants; Postgres
 * rejected every one with `invalid input syntax for type uuid`, and the whole
 * seed failed on its first insert. Only 0-9 and a-f are legal here.
 */
function productId(index: number): string {
  return `e0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;
}

function variantId(productIndex: number, variantIndex: number): string {
  return `f0000000-0000-4000-8000-${String(productIndex * 10 + variantIndex + 1).padStart(12, "0")}`;
}

async function seed() {
  const password_hash = await hash("password123", 12);

  // One account per role, so the RBAC split can be exercised immediately.
  await db
    .insert(users)
    .values([
      {
        id: "d0000000-0000-4000-8000-000000000001",
        email: "admin@northwind.shop",
        full_name: "Ada Okonkwo",
        role: "admin",
        password_hash,
      },
      {
        id: "d0000000-0000-4000-8000-000000000002",
        email: "staff@northwind.shop",
        full_name: "Sam Whitfield",
        role: "staff",
        password_hash,
      },
      {
        id: "d0000000-0000-4000-8000-000000000003",
        email: "customer@northwind.shop",
        full_name: "Jo Bello",
        role: "customer",
        password_hash,
      },
    ])
    .onConflictDoNothing();

  await db.insert(categories).values(categoryRows).onConflictDoNothing();

  await db
    .insert(products)
    .values(
      productRows.map((product, index) => ({
        id: productId(index),
        slug: product.slug,
        title: product.title,
        summary: product.summary,
        description: product.description,
        images: product.images,
        category_id: categoryRows[product.categoryIndex].id,
        is_published: true,
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(variants)
    .values(
      productRows.flatMap((product, productIndex) =>
        product.variants.map((variant, index) => ({
          id: variantId(productIndex, index),
          product_id: productId(productIndex),
          // Derived from the full slug, which is unique, so the SKU is too.
          // Truncating to eight characters collided "wildflower-seed-paper" with
          // "wildflower-honey", and the unique constraint silently dropped one
          // variant via onConflictDoNothing — a missing product option that no
          // error reported.
          sku: `NW-${product.slug.toUpperCase().replace(/-/g, "")}-${index + 1}`,
          name: variant.name,
          price: variant.price,
          stock: variant.stock,
          is_active: true,
        })),
      ),
    )
    .onConflictDoNothing();

  const variantCount = productRows.reduce((total, product) => total + product.variants.length, 0);
  console.log(
    `Seeded Northwind Market: ${categoryRows.length} categories, ${productRows.length} products, ${variantCount} variants, 3 accounts.`,
  );
  console.log("Sign in with admin@northwind.shop / staff@northwind.shop / customer@northwind.shop — password123");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
