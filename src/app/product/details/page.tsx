import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import BreadcrumbProduct from "@/components/Breadcrumb/BreadcrumbProduct";
import Default from "@/components/Product/Detail/Default";
import Footer from "@/components/Footer/Footer";
import {
  productsService,
  mapToProductType,
  ApiProduct,
} from "@/services/products";

interface ProductDetailsProps {
  searchParams: Promise<{ id?: string }>;
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://mossim.net"
).replace(/\/$/, "");

const cleanText = (value?: string): string =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const absoluteImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return `${SITE_URL}/images/mossim.png`;

  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

  return `${SITE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

export async function generateMetadata({
  searchParams,
}: ProductDetailsProps): Promise<Metadata> {
  const { id } = await searchParams;

  if (!id) {
    return {
      title: "Product Not Found | MOSSIM",
      description: "The requested MOSSIM product could not be found.",
      robots: { index: false, follow: false },
    };
  }

  try {
    const product = await productsService.show(id);
    const title = `${product.name} | MOSSIM`;
    const description =
      cleanText(product.description).slice(0, 200) ||
      `Shop ${product.name} from MOSSIM ${product.type} collection.`;
    const image = absoluteImageUrl(
      product.images.find((item) => item.is_primary)?.url ||
        product.images[0]?.url,
    );
    const url = `${SITE_URL}/product/details?id=${encodeURIComponent(id)}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        siteName: "MOSSIM",
        locale: "en_US",
        url,
        title: product.name,
        description: `${product.type.toUpperCase()} | ${description}`,
        images: [
          {
            url: image,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: `${product.type.toUpperCase()} | ${description}`,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Product Not Found | MOSSIM",
      description: "The requested MOSSIM product could not be found.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function ProductDetails({
  searchParams,
}: ProductDetailsProps) {
  const { id: productId } = await searchParams;

  if (!productId) notFound();

  let apiProduct: ApiProduct;

  try {
    apiProduct = await productsService.show(productId);
  } catch {
    notFound();
  }

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
