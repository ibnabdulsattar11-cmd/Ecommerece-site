/**
 * Simple slugify helper - converts "Men's Running Shoes" -> "mens-running-shoes"
 * Works fine for English names; Arabic names keep their own separate slug
 * source (nameEn) so URLs stay Latin/ASCII and SEO/routing-friendly.
 */
export default function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word chars
    .replace(/[\s_-]+/g, "-") // collapse whitespace/underscores into a dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}
