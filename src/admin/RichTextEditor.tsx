import { useEffect, useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { api } from "../lib/api";
import { useAdminI18n } from "./AdminLanguageContext";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs font-semibold border ${
        active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const { tr } = useAdminI18n();
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (!editor || htmlMode) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [value, editor, htmlMode]);

  const switchToHtml = () => {
    if (editor) setRawHtml(editor.getHTML());
    setHtmlMode(true);
  };

  const switchToVisual = () => {
    onChange(rawHtml);
    if (editor) editor.commands.setContent(rawHtml || "<p></p>");
    setHtmlMode(false);
  };

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      try {
        const { url } = await api.upload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        /* ignore */
      }
    };
    input.click();
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
        <button
          type="button"
          onClick={() => !htmlMode || switchToVisual()}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            !htmlMode ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {tr("visual")} {!htmlMode && "●"}
        </button>
        <button
          type="button"
          onClick={() => htmlMode || switchToHtml()}
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            htmlMode ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {tr("htmlMode")}
        </button>
      </div>

      {!htmlMode && editor && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>B</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>I</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}>U</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>H1</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}>H3</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>• List</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>1. List</ToolbarButton>
          <ToolbarButton onClick={setLink} active={editor.isActive("link")}>Link</ToolbarButton>
          <ToolbarButton onClick={addImage}>Image</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>Quote</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()}>←</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()}>↔</ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()}>→</ToolbarButton>
        </div>
      )}

      {htmlMode ? (
        <textarea
          value={rawHtml}
          onChange={(e) => {
            setRawHtml(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[200px] p-3 font-mono text-sm outline-none"
          dir="ltr"
        />
      ) : (
        <EditorContent
          editor={editor}
          className="prose max-w-none p-3 min-h-[200px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[180px]"
        />
      )}
    </div>
  );
}
