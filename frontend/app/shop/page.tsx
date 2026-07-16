import Image from "next/image";
import Link from "next/link";
import { API_URL } from "../api";
import { ProductType } from "../types/ProductType";

const MAX_LATEST_FINDS = 4;

const slugifyCategory = (value: string) =>
  value.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");

const normalizeImageUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "storage.cloud.google.com") {
      parsed.hostname = "storage.googleapis.com";
    }

    if (parsed.hostname === "storage.googleapis.com") {
      parsed.pathname = decodeURIComponent(parsed.pathname);
    }

    return parsed.toString();
  } catch {
    return url;
  }
};

const getProductImage = (product: ProductType) => {
  const rawUrl =
    product.imageUrl ||
    product.image ||
    `https://placehold.co/600x400/png?text=${encodeURIComponent(product.name || "Product")}`;

  const normalizedUrl = normalizeImageUrl(rawUrl);

  return normalizedUrl.includes("placehold.co/") && !normalizedUrl.includes("/png?")
    ? normalizedUrl.replace(/\/(\d+x\d+)\?/, "/$1/png?")
    : normalizedUrl;
};

const shuffleProducts = (products: ProductType[]) => {
  const shuffled = [...products];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

async function fetchProducts(): Promise<ProductType[]> {
  try {
    const response = await fetch(`${API_URL}/products`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    return Array.isArray(payload) ? payload : [];
  } catch {
    return [];
  }
}

export default async function ShopHome() {
  const products = await fetchProducts();
  const categories = Array.from(
    new Set(products.map((product) => product.category || "Uncategorized"))
  );
  const latestFinds = shuffleProducts(products).slice(0, MAX_LATEST_FINDS);
  const categoryPreviewImageByName = new Map<string, string>();

  products.forEach((product) => {
    const category = product.category || "Uncategorized";
    if (!categoryPreviewImageByName.has(category)) {
      categoryPreviewImageByName.set(category, getProductImage(product));
    }
  });

  return (
    <>
      <section className="space-y-16 pb-16">
        {/* Hero Section */}
        <div className="overflow-hidden rounded-3xl bg-[#aa9284] text-[#f5ede9] shadow-2xl relative isolate p-8 md:p-16">
          <div className="grid items-center gap-8 lg:grid-cols-2 relative z-10">
            <div>
              <p className="mb-4 inline-block rounded-full bg-[#6b5247] px-4 py-1.5 text-xs font-bold tracking-widest text-white">
                PREMIUM MARKETPLACE
              </p>
              <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-6xl md:leading-[1.1]">
                Curated essentials for the modern lifestyle.
              </h1>
              <p className="mt-6 max-w-2xl text-base text-[#d6cfc9] md:text-xl font-medium">
                Experience seamless browsing, handpicked selections, and a refined shopping journey tailored for you.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/shop/products"
                  className="rounded-xl bg-[#f5ede9] px-8 py-4 text-sm font-bold text-[#4a3b32] transition hover:bg-white hover:scale-105"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/shop/orders"
                  className="rounded-xl border-2 border-[#6b5247] bg-transparent px-8 py-4 text-sm font-bold text-[#f5ede9] transition hover:bg-[#6b5247]"
                >
                  Order History
                </Link>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/mastery_commerce.png"
                alt="Premium Commerce"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Categories Row */}

        <div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/shop/products?category=${encodeURIComponent(
                  slugifyCategory(category)
                )}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-200 shadow-sm transition hover:shadow-md"
              >
                <img
                  src={
                    categoryPreviewImageByName.get(category) ||
                    `https://placehold.co/600x600/png?text=${encodeURIComponent(category)}`
                  }
                  alt={category}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                <h3 className="absolute bottom-4 left-4 text-base font-bold tracking-wide text-white md:bottom-5 md:left-5 md:text-lg">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest Finds Section */}
        <div>
          <div className="mb-6 flex items-baseline justify-between border-b border-slate-100 pb-4">
            <h2 className="text-3xl font-bold tracking-tight text-[#4a3b32]">Latest Finds</h2>
            <Link
              href="/shop/products"
              className="flex items-center gap-1 text-sm font-semibold text-slate-800 transition hover:text-slate-600"
            >
              View All <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {latestFinds.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {latestFinds.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/products/${encodeURIComponent(product.id)}`}
                  className="group block cursor-pointer"
                >
                  <div className="relative mb-4 aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    <div className="absolute left-3 top-3 z-10 rounded-md bg-white px-2 py-1 text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm">
                      New
                    </div>
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{product.category || "Uncategorized"}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    KES {Number(product.unitCost).toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
              No products available yet.
            </p>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full border-t border-gray-200 bg-white px-6 py-12 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 md:flex-row">

          {/* Left Text */}
          <div className="max-w-xs">
            <h2 className="text-xl font-bold tracking-tight text-[#4a3b32]">
              Soko Marketplace
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              &copy; 2026 Soko Marketplace. The curated marketplace for everything you love.
            </p>
          </div>

          {/* Right Links Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-slate-600 sm:grid-cols-3 md:text-right">

            <div className="flex flex-col space-y-3">
              <Link href="#" className="hover:text-slate-900">Appliances</Link>
              <Link href="#" className="hover:text-slate-900">Clothing</Link>
              <Link href="#" className="hover:text-slate-900">Health & Beauty</Link>
              <Link href="#" className="hover:text-slate-900">Toys</Link>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="#" className="hover:text-slate-900">Automotive</Link>
              <Link href="#" className="hover:text-slate-900">Electronics</Link>
              <Link href="#" className="hover:text-slate-900">Home & Garden</Link>
              <Link href="#" className="hover:text-slate-900">Privacy Policy</Link>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="#" className="hover:text-slate-900">Books</Link>
              <Link href="#" className="hover:text-slate-900">Furniture</Link>
              <Link href="#" className="hover:text-slate-900">Sports</Link>
              <Link href="#" className="hover:text-slate-900">Contact Us</Link>
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}