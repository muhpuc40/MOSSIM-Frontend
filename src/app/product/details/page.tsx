import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import BreadcrumbProduct from "@/components/Breadcrumb/BreadcrumbProduct";
import Default from "@/components/Product/Detail/Default";
import Footer from "@/components/Footer/Footer";
import { productsService, mapToProductType } from "@/services/products";

export default async function ProductDetails({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id: productId } = await searchParams;

  if (!productId) {
    return <div>Product not found.</div>;
  }

  const apiProduct = await productsService.show(productId);
  const product = mapToProductType(apiProduct);

  return (
    <>
      <TopNavOne props="style-one bg-black" />

      <div id="header" className="relative w-full">
        <MenuOne props="bg-white" />

        <BreadcrumbProduct
          data={[product]}
          productPage="Details"
          productId={productId}
        />
      </div>

      <Default data={[product]} productId={productId} />

      <Footer />
    </>
  );
}
