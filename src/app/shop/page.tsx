import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import ShopBreadCrumb1 from "@/components/Shop/ShopBreadCrumb1";
import Footer from "@/components/Footer/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function BreadCrumb1({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const type = searchParams.type ?? null;
  const category = searchParams.category ?? null;
  const gender = searchParams.gender ?? null;

  const params = new URLSearchParams();
  params.set("per_page", "9");
  params.set("page", "1");
  if (type) params.set("type", type);
  if (category) params.set("category", category);

  const [productsRes, shopDataRes] = await Promise.all([
    fetch(`${API_URL}/products?${params}`, { cache: "no-store" }),
    fetch(`${API_URL}/products/shop-data`, { cache: "no-store" }),
  ]);

  const productsJson = await productsRes.json();
  const shopDataJson = await shopDataRes.json();

  return (
    <>
      <TopNavOne props="style-one bg-black" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
      </div>
      <ShopBreadCrumb1
        productPerPage={9}
        dataType={type}
        gender={gender}
        category={category}
        initialProducts={productsJson.data ?? []}
        initialMeta={productsJson.meta ?? null}
        initialShopData={shopDataJson.data ?? null}
      />
      <Footer />
    </>
  );
}
