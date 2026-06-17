import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { api, type BlogRecord } from "../../lib/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { TableOfContents } from "../components/TableOfContents";
import { injectHeadingIds } from "../../lib/seo";
import { countWords } from "../../lib/seo";

function BlogPostInner() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<BlogRecord | null>(null);
  const darkMode = false;

  useEffect(() => {
    if (slug) api.publicBlog(slug).then(setBlog).catch(() => setBlog(null));
  }, [slug]);

  if (!blog) return <div className="p-10 text-center">Loading...</div>;

  const bodyHtml = injectHeadingIds(blog.body);
  const showToc =
    blog.show_toc !== 0 && countWords(blog.body) >= (blog.toc_min_words ?? 300);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.meta_title || blog.title,
    description: blog.meta_description || blog.excerpt,
    image: blog.og_image || blog.cover_image,
    author: { "@type": "Person", name: blog.author_name },
    datePublished: blog.published_at,
    url: typeof window !== "undefined" ? window.location.href : "",
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50" style={{ fontFamily: "Cairo, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header darkMode={darkMode} highContrast={false} fontSize={16} onToggleDark={() => {}} onToggleContrast={() => {}} onFontIncrease={() => {}} onFontDecrease={() => {}} onListen={() => {}} />
      <article className="max-w-3xl mx-auto px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "الرئيسية", href: "/" },
            { label: "الأخبار", href: "/blogs" },
            ...(blog.category_name && blog.category_slug ? [{ label: blog.category_name, href: `/categories/${blog.category_slug}` }] : blog.category_name ? [{ label: blog.category_name }] : []),
            { label: blog.title },
          ]}
        />
        {blog.cover_image && (
          <img
            src={blog.cover_image}
            alt={blog.cover_image_alt || blog.title}
            className="w-full rounded-2xl mb-6"
            loading="lazy"
          />
        )}
        {blog.category_name && blog.category_slug ? <a href={`/categories/${blog.category_slug}`} className="text-sm text-blue-600 font-bold hover:underline">{blog.category_name}</a> : <span className="text-sm text-blue-600 font-bold">{blog.category_name}</span>}
        <h1 className="text-3xl font-black mt-2 mb-4">{blog.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {blog.author_name} · {blog.published_at?.slice(0, 10)} · {blog.view_count ?? 0} مشاهدة
        </p>
        {showToc && <TableOfContents html={bodyHtml} />}
        <div className="prose max-w-none leading-loose" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {blog.tags.map((t) => (
              <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </article>
      <Footer darkMode={darkMode} />
    </div>
  );
}

export function BlogPostPage() {
  return <BlogPostInner />;
}
