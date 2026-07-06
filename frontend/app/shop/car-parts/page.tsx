"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useShop } from "../ShopProvider";

type CarPart = {
  id: string;
  sku: string;
  make: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  brand: string;
  batteryType: string;
  capacityAh: string;
  cca: string;
  voltage: string;
  engineCc: string;
  branchLocation: string;
  stock: string;
  warrantyMonths: string;
  priceKes: string;
  imageUrl?: string;
  created_at: string;
  updated_at: string;
  order_id: string | null;
};

const withDummyImageUrl = (part: CarPart): CarPart => {
  const lock = Array.from(part.sku).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    ...part,
    imageUrl: `https://loremflickr.com/600/400/car-battery?lock=${lock}`,
  };
};

const carParts: CarPart[] = [
  { updated_at: "2026-06-30 08:34:45.689000 UTC", warrantyMonths: "24", branchLocation: "Karen", priceKes: "36000.0", cca: "760", engineCc: "4500", brand: "GS Yuasa", yearTo: "2024", id: "7727773c-8d8a-4c17-bf10-9939cfff0ec2", yearFrom: "2010", batteryType: "N100", model: "Land Cruiser V8", capacityAh: "100", make: "Toyota", created_at: "2026-06-30 08:34:45.689000 UTC", stock: "2", voltage: "12", sku: "PRT-011", order_id: null },
  { updated_at: "2026-06-30 08:34:43.353000 UTC", warrantyMonths: "18", branchLocation: "Karen", priceKes: "23500.0", cca: "590", engineCc: "2700", brand: "ExideGold", yearTo: "2017", id: "0aacc4f4-c159-4bf8-8a07-009e8377b9f9", yearFrom: "2010", batteryType: "N70", model: "Prado 150", capacityAh: "70", make: "Toyota", created_at: "2026-06-30 08:34:43.353000 UTC", stock: "4", voltage: "12", sku: "PRT-009", order_id: null },
  { updated_at: "2026-06-30 08:35:13.075000 UTC", warrantyMonths: "24", branchLocation: "Karen", priceKes: "24000.0", cca: "590", engineCc: "3200", brand: "Bosch", yearTo: "2014", id: "278c4f82-222d-4688-b08b-14a6b631ce2b", yearFrom: "2005", batteryType: "N70", model: "Pajero", capacityAh: "70", make: "Mitsubishi", created_at: "2026-06-30 08:35:13.075000 UTC", stock: "3", voltage: "12", sku: "PRT-039", order_id: null },
  { updated_at: "2026-06-30 08:35:04.411000 UTC", warrantyMonths: "24", branchLocation: "Westlands", priceKes: "25500.0", cca: "590", engineCc: "2500", brand: "Bosch", yearTo: "2024", id: "4d23e820-2d64-440a-8e1e-a25de5557cda", yearFrom: "2015", batteryType: "N70", model: "Navara", capacityAh: "70", make: "Nissan", created_at: "2026-06-30 08:35:04.411000 UTC", stock: "3", voltage: "12", sku: "PRT-030", order_id: null },
  { updated_at: "2026-06-30 08:34:44.460000 UTC", warrantyMonths: "24", branchLocation: "Westlands", priceKes: "26000.0", cca: "590", engineCc: "2700", brand: "Bosch", yearTo: "2024", id: "5bc6e564-8413-4e70-81f6-9034d1193b69", yearFrom: "2018", batteryType: "N70", model: "Prado 150", capacityAh: "70", make: "Toyota", created_at: "2026-06-30 08:34:44.460000 UTC", stock: "3", voltage: "12", sku: "PRT-010", order_id: null },
  { updated_at: "2026-06-30 08:34:46.812000 UTC", warrantyMonths: "24", branchLocation: "CBD", priceKes: "27500.0", cca: "590", engineCc: "2800", brand: "Varta", yearTo: "2024", id: "93ef272f-bba3-4c4a-ba36-9057d27297fe", yearFrom: "2015", batteryType: "N70", model: "Hilux Revo", capacityAh: "70", make: "Toyota", created_at: "2026-06-30 08:34:46.812000 UTC", stock: "3", voltage: "12", sku: "PRT-012", order_id: null },
  { updated_at: "2026-06-30 08:34:34.445000 UTC", warrantyMonths: "18", branchLocation: "Westlands", priceKes: "8500.0", cca: "340", engineCc: "1000", brand: "ExideGold", yearTo: "2014", id: "4e2f7ece-e63b-4e94-8a0c-bdf296bc9890", yearFrom: "2010", batteryType: "NS40ZL", model: "Vitz", capacityAh: "36", make: "Toyota", created_at: "2026-06-30 08:34:34.445000 UTC", stock: "12", voltage: "12", sku: "PRT-001", order_id: null },
  { updated_at: "2026-06-30 08:34:57.968000 UTC", warrantyMonths: "18", branchLocation: "CBD", priceKes: "8500.0", cca: "340", engineCc: "1200", brand: "ExideGold", yearTo: "2016", id: "a1795497-1850-45ac-bf77-d3d3a2f765fa", yearFrom: "2012", batteryType: "NS40ZL", model: "Note", capacityAh: "36", make: "Nissan", created_at: "2026-06-30 08:34:57.968000 UTC", stock: "11", voltage: "12", sku: "PRT-023", order_id: null },
  { updated_at: "2026-06-30 08:35:20.714000 UTC", warrantyMonths: "18", branchLocation: "CBD", priceKes: "8500.0", cca: "340", engineCc: "1200", brand: "Chloride", yearTo: "2017", id: "d78a22c3-0252-431a-b81c-a561573e25fd", yearFrom: "2010", batteryType: "NS40ZL", model: "Swift", capacityAh: "36", make: "Suzuki", created_at: "2026-06-30 08:35:20.714000 UTC", stock: "10", voltage: "12", sku: "PRT-047", order_id: null },
  { updated_at: "2026-06-30 08:34:49.985000 UTC", warrantyMonths: "18", branchLocation: "CBD", priceKes: "8800.0", cca: "340", engineCc: "1300", brand: "Chloride", yearTo: "2014", id: "1f2248ef-eb86-41a6-ab74-68d8345da6da", yearFrom: "2008", batteryType: "NS40ZL", model: "Demio", capacityAh: "36", make: "Mazda", created_at: "2026-06-30 08:34:49.985000 UTC", stock: "9", voltage: "12", sku: "PRT-015", order_id: null },
  { updated_at: "2026-06-30 08:34:58.885000 UTC", warrantyMonths: "18", branchLocation: "Kilimani", priceKes: "8800.0", cca: "340", engineCc: "1200", brand: "Chloride", yearTo: "2024", id: "14f7f900-fcf8-43eb-a8a8-a7c9b274ab71", yearFrom: "2017", batteryType: "NS40ZL", model: "Note", capacityAh: "36", make: "Nissan", created_at: "2026-06-30 08:34:58.885000 UTC", stock: "9", voltage: "12", sku: "PRT-024", order_id: null },
  { updated_at: "2026-06-30 08:34:51.114000 UTC", warrantyMonths: "18", branchLocation: "Kilimani", priceKes: "9200.0", cca: "340", engineCc: "1300", brand: "Amaron", yearTo: "2019", id: "2cbeaf0a-de72-4c43-bc6c-ec7ee7245b56", yearFrom: "2015", batteryType: "NS40ZL", model: "Demio", capacityAh: "36", make: "Mazda", created_at: "2026-06-30 08:34:51.114000 UTC", stock: "7", voltage: "12", sku: "PRT-016", order_id: null },
  { updated_at: "2026-06-30 08:34:36.067000 UTC", warrantyMonths: "18", branchLocation: "Karen", priceKes: "9200.0", cca: "340", engineCc: "1000", brand: "Amaron", yearTo: "2019", id: "ee5d1a01-3607-46f3-8e87-55be19e646d2", yearFrom: "2015", batteryType: "NS40ZL", model: "Vitz", capacityAh: "36", make: "Toyota", created_at: "2026-06-30 08:34:36.067000 UTC", stock: "8", voltage: "12", sku: "PRT-002", order_id: null },
  { updated_at: "2026-06-30 08:35:21.776000 UTC", warrantyMonths: "18", branchLocation: "Langata", priceKes: "9200.0", cca: "340", engineCc: "1200", brand: "Amaron", yearTo: "2024", id: "707d2e1a-caf2-4eb9-a24f-96cab12fce66", yearFrom: "2018", batteryType: "NS40ZL", model: "Swift", capacityAh: "36", make: "Suzuki", created_at: "2026-06-30 08:35:21.776000 UTC", stock: "7", voltage: "12", sku: "PRT-048", order_id: null },
  { updated_at: "2026-06-30 08:34:52.240000 UTC", warrantyMonths: "24", branchLocation: "Karen", priceKes: "9800.0", cca: "340", engineCc: "1500", brand: "Bosch", yearTo: "2024", id: "1e96c91e-7769-425b-95c8-238534632679", yearFrom: "2020", batteryType: "NS40ZL", model: "Demio", capacityAh: "36", make: "Mazda", created_at: "2026-06-30 08:34:52.240000 UTC", stock: "5", voltage: "12", sku: "PRT-017", order_id: null },
  { updated_at: "2026-06-30 08:34:37.051000 UTC", warrantyMonths: "24", branchLocation: "CBD", priceKes: "9800.0", cca: "340", engineCc: "1000", brand: "Bosch", yearTo: "2024", id: "8ac72f91-2c9c-46da-9cb3-a105b9b6031e", yearFrom: "2020", batteryType: "NS40ZL", model: "Vitz", capacityAh: "36", make: "Toyota", created_at: "2026-06-30 08:34:37.051000 UTC", stock: "6", voltage: "12", sku: "PRT-003", order_id: null },
  { updated_at: "2026-06-30 08:34:53.147000 UTC", warrantyMonths: "18", branchLocation: "Westlands", priceKes: "11000.0", cca: "430", engineCc: "1600", brand: "ExideGold", yearTo: "2016", id: "3a63330e-f74d-43ad-9730-c7477ea3124c", yearFrom: "2010", batteryType: "NS60", model: "Axela", capacityAh: "45", make: "Mazda", created_at: "2026-06-30 08:34:53.147000 UTC", stock: "8", voltage: "12", sku: "PRT-018", order_id: null },
  { updated_at: "2026-06-30 08:34:38.558000 UTC", warrantyMonths: "18", branchLocation: "Langata", priceKes: "11000.0", cca: "430", engineCc: "1500", brand: "ExideGold", yearTo: "2012", id: "adfc9a7a-6e17-451b-a999-96501968c9db", yearFrom: "2004", batteryType: "NS60", model: "Fielder", capacityAh: "45", make: "Toyota", created_at: "2026-06-30 08:34:38.558000 UTC", stock: "10", voltage: "12", sku: "PRT-004", order_id: null },
  { updated_at: "2026-06-30 08:35:19.561000 UTC", warrantyMonths: "24", branchLocation: "Westlands", priceKes: "18000.0", cca: "490", engineCc: "2400", brand: "Varta", yearTo: "2018", id: "7e0aa394-dc07-45a4-96a8-0cbacc80e89b", yearFrom: "2010", batteryType: "S85D26R", model: "Accord", capacityAh: "55", make: "Honda", created_at: "2026-06-30 08:35:19.561000 UTC", stock: "4", voltage: "12", sku: "PRT-046", order_id: null },
  { updated_at: "2026-06-30 08:35:07.171000 UTC", warrantyMonths: "24", branchLocation: "Westlands", priceKes: "23500.0", cca: "550", engineCc: "2500", brand: "Varta", yearTo: "2024", id: "076447eb-52b6-4dcc-8e48-4e461ac5acbc", yearFrom: "2018", batteryType: "S95D26L", model: "Forester SK", capacityAh: "65", make: "Subaru", created_at: "2026-06-30 08:35:07.171000 UTC", stock: "3", voltage: "12", sku: "PRT-033", order_id: null },
  { updated_at: "2026-06-30 08:35:01.648000 UTC", warrantyMonths: "24", branchLocation: "CBD", priceKes: "23000.0", cca: "550", engineCc: "2500", brand: "Varta", yearTo: "2024", id: "8a1ba5b4-0e3d-4d72-a1c4-ee38c340bfd3", yearFrom: "2020", batteryType: "S95D26R", model: "X-Trail T32", capacityAh: "65", make: "Nissan", created_at: "2026-06-30 08:35:01.648000 UTC", stock: "3", voltage: "12", sku: "PRT-027", order_id: null }
].map(withDummyImageUrl);

const formatKes = (value: string) =>
  `KES ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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

const getPartImage = (part: CarPart) =>
  normalizeImageUrl(
    part.imageUrl ||
      `https://placehold.co/600x400/png?text=${encodeURIComponent(`${part.make} ${part.model}`)}`
  );

const getFakeRating = (part: CarPart) => {
  const source = `${part.id}-${part.sku}-${part.brand}`;
  const hash = Array.from(source).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (3.8 + (hash % 13) / 10).toFixed(1);
};

export default function CarPartsPage() {
  const { addToCart } = useShop();
  const [activeMake, setActiveMake] = useState<string>("All");
  const [activeBranch, setActiveBranch] = useState<string>("All");

  const toShopProduct = (part: CarPart) => ({
    id: part.id,
    name: `${part.brand} ${part.make} ${part.model} ${part.batteryType}`,
    category: "Car Parts",
    unitCost: part.priceKes,
    quantity: Number(part.stock),
  });

  const makes = useMemo(() => {
    const unique = Array.from(new Set(carParts.map((item) => item.make)));
    return ["All", ...unique];
  }, []);

  const branches = useMemo(() => {
    const unique = Array.from(new Set(carParts.map((item) => item.branchLocation)));
    return ["All", ...unique];
  }, []);

  const visibleParts = useMemo(() => {
    return carParts.filter((item) => {
      const matchesMake = activeMake === "All" || item.make === activeMake;
      const matchesBranch = activeBranch === "All" || item.branchLocation === activeBranch;
      return matchesMake && matchesBranch;
    });
  }, [activeBranch, activeMake]);

  return (
    <section className="space-y-7 pb-8">
      <div className="rounded-3xl border border-blue-200 bg-[linear-gradient(120deg,#e0f2fe_0%,#eef2ff_45%,#fffbeb_100%)] p-6 md:p-8">
        <p className="inline-block rounded-full bg-white px-3 py-1 text-xs font-bold tracking-wide text-blue-700">
          AUTO PARTS CATALOG
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Car Parts
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700 md:text-base">
          Explore battery options by make, branch, and vehicle fitment using starter
          dummy data.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Filter by make
          <select
            value={activeMake}
            onChange={(event) => setActiveMake(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Filter by branch
          <select
            value={activeBranch}
            onChange={(event) => setActiveBranch(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visibleParts.map((part) => {
          const availableStock = Number(part.stock);
          const isOutOfStock = availableStock <= 0;

          return (
          <article key={part.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="relative mb-4 h-44 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <Image
                src={getPartImage(part)}
                alt={`${part.brand} ${part.make} ${part.model}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {part.make} {part.model}
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {part.batteryType}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {part.branchLocation}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold text-slate-900">{part.brand}</h2>
            <p className="text-sm text-slate-600">
              {part.model} ({part.yearFrom} - {part.yearTo})
            </p>

            <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
              <p className="flex items-center gap-1">
                <span className="text-amber-500">★</span>
                <span className="font-semibold text-slate-900">{getFakeRating(part)}</span>
              </p>
              <p>
                In stock: <span className="font-semibold text-slate-900">{availableStock}</span>
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Price</dt>
                <dd className="font-semibold text-slate-900">{formatKes(part.priceKes)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Capacity / CCA</dt>
                <dd className="font-semibold text-slate-900">
                  {part.capacityAh}Ah / {part.cca}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Warranty</dt>
                <dd className="font-semibold text-slate-900">{part.warrantyMonths} months</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-slate-500">Engine Capacity</dt>
                <dd className="font-semibold text-slate-900">{part.engineCc}cc</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-slate-500">
              SKU: <span className="font-medium text-slate-700">{part.sku}</span>
            </p>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                addToCart(toShopProduct(part));
                toast.success(`${part.brand} ${part.model} added to cart`);
              }}
              className="mt-4 w-full rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </article>
          );
        })}
      </div>

      {visibleParts.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No parts found for this filter combination.
        </p>
      ) : null}
    </section>
  );
}
