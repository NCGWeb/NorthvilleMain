"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, Heading3, Italic, LinkIcon, List, ListOrdered, Quote, ImageIcon, Undo2 } from "lucide-react";
import { useState } from "react";
import { Picker } from "./MediaPicker";

export function RichText({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [pickImage, setPickImage] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: false }), Link.configure({ openOnClick: false, autolink: true }), Image],
    content: value || "",
    immediatelyRender: false,
    editorProps: { attributes: { class: "editor-content" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return <div className="input h-56" />;

  const Btn = ({ on, label, active, children }: { on: () => void; label: string; active?: boolean; children: React.ReactNode }) => (
    <button type="button" title={label} aria-label={label} onClick={on} className={`rounded-md p-2 hover:bg-mist ${active ? "bg-sky/60 text-navy" : "text-ink"}`}>{children}</button>
  );
  function setLink() {
    const prev = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Where should this link go? Paste a web address, or leave empty to remove the link.", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor!.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }
  return (
    <div className="rounded-xl border border-line bg-white focus-within:border-royal">
      <div className="flex flex-wrap gap-0.5 border-b border-line p-1.5">
        <Btn label="Big heading" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}><Heading2 size={17} /></Btn>
        <Btn label="Small heading" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })}><Heading3 size={17} /></Btn>
        <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><Bold size={17} /></Btn>
        <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><Italic size={17} /></Btn>
        <Btn label="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><List size={17} /></Btn>
        <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><ListOrdered size={17} /></Btn>
        <Btn label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}><Quote size={17} /></Btn>
        <Btn label="Link" on={setLink} active={editor.isActive("link")}><LinkIcon size={17} /></Btn>
        <Btn label="Picture" on={() => setPickImage(true)}><ImageIcon size={17} /></Btn>
        <Btn label="Undo" on={() => editor.chain().focus().undo().run()}><Undo2 size={17} /></Btn>
      </div>
      <EditorContent editor={editor} />
      {pickImage && <Picker onClose={() => setPickImage(false)} onPick={(u, libraryAlt) => {
        // Every picture in an article needs a description for screen readers and Google. Start from the one saved in the Media library.
        const alt = window.prompt("Describe this picture in a few words (read aloud by screen readers, and used by Google).", libraryAlt) ?? libraryAlt;
        editor.chain().focus().setImage({ src: u, alt }).run(); setPickImage(false);
      }} />}
    </div>
  );
}

