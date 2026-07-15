export type ShareProductResult =
  | "shared"
  | "copied"
  | "cancelled"
  | "failed";

interface ShareProductInput {
  id: string | number;
  name: string;
  type?: string;
  description?: string;
}

const copyText = async (value: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};

export const getProductShareUrl = (id: string | number): string => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const siteUrl = configuredSiteUrl || window.location.origin;

  return `${siteUrl}/product/details?id=${encodeURIComponent(String(id))}`;
};

export const shareProduct = async ({
  id,
  name,
  type,
  description,
}: ShareProductInput): Promise<ShareProductResult> => {
  if (typeof window === "undefined") return "failed";

  const url = getProductShareUrl(id);
  const cleanDescription = description
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  const text = [
    type ? `${type.toUpperCase()} | MOSSIM` : "MOSSIM",
    cleanDescription,
  ]
    .filter(Boolean)
    .join("\n");

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: name, text, url });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }

  return (await copyText(url)) ? "copied" : "failed";
};
