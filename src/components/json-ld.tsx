import { getAdvancedSchemas } from "@/lib/seo/schemas";

export default function JsonLd() {
  const schemas = getAdvancedSchemas();

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
