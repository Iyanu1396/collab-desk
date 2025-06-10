"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TextStyle from "@tiptap/extension-text-style";

import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  Table as TableIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code2,
  Underline as UnderlineIcon,
  Highlighter,
  Palette,

} from "lucide-react";
import SlashCommand from "./slash-command";

const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("typescript", typescript);
lowlight.register("css", css);
lowlight.register("python", python);
lowlight.register("json", json);
lowlight.register("bash", bash);

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export default function RichTextEditor({
  content = "",
  onChange,
  placeholder = 'Start typing or type "/" for commands...',
  editable = true,
  className = "",
}: RichTextEditorProps) {
  const [showToolbar, setShowToolbar] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState(false);
 

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline cursor-pointer",
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg border border-gray-200",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class:
            "bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      SlashCommand,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    onFocus: () => {
      setShowToolbar(true);
    },
    onBlur: ({ event }) => {
      // Don't hide toolbar if clicking on a toolbar button
      const target = event?.relatedTarget as HTMLElement;
      if (target?.closest("[data-toolbar]")) {
        return;
      }
      setTimeout(() => setShowToolbar(false), 200);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] p-6 text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="animate-pulse border border-gray-200 rounded-lg p-6">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button" // Important for form contexts
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-blue-100 text-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter the URL of the image:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <div
      className={`relative border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}
    >
      {/* Fixed Toolbar */}
      {editable && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          {/* Main Toolbar */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-1 flex-wrap">
              {/* History */}
              <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
                <span className="text-xs font-medium text-gray-500 mr-2">
                  History
                </span>
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  title="Undo"
                >
                  <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  title="Redo"
                >
                  <Redo className="w-4 h-4" />
                </ToolbarButton>
              </div>

              {/* Headings */}
              <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
                <span className="text-xs font-medium text-gray-500 mr-2">
                  Structure
                </span>
                <ToolbarButton
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  isActive={editor.isActive("paragraph")}
                  title="Paragraph"
                >
                  <Type className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  isActive={editor.isActive("heading", { level: 1 })}
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  isActive={editor.isActive("heading", { level: 2 })}
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  isActive={editor.isActive("heading", { level: 3 })}
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </ToolbarButton>
              </div>

              {/* Text Formatting */}
              <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
                <span className="text-xs font-medium text-gray-500 mr-2">
                  Format
                </span>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  isActive={editor.isActive("bold")}
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  isActive={editor.isActive("italic")}
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  isActive={editor.isActive("underline")}
                  title="Underline"
                >
                  <UnderlineIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  isActive={editor.isActive("strike")}
                  title="Strikethrough"
                >
                  <Strikethrough className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  isActive={editor.isActive("code")}
                  title="Inline Code"
                >
                  <Code className="w-4 h-4" />
                </ToolbarButton>
              </div>

              {/* Color & Highlight */}
              <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
                <span className="text-xs font-medium text-gray-500 mr-2">
                  Color
                </span>
                <div className="relative">
                  <ToolbarButton
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    title="Text Color"
                  >
                    <Palette className="w-4 h-4" />
                  </ToolbarButton>
                  {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20">
                      <div className="grid grid-cols-8 gap-1">
                        {[
                          "#000000",
                          "#374151",
                          "#6B7280",
                          "#EF4444",
                          "#F59E0B",
                          "#10B981",
                          "#3B82F6",
                          "#8B5CF6",
                          "#EC4899",
                          "#F97316",
                          "#84CC16",
                          "#06B6D4",
                          "#6366F1",
                          "#A855F7",
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              editor.chain().focus().setColor(color).run();
                              setShowColorPicker(false);
                            }}
                            className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            title={`Set color to ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <ToolbarButton
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .toggleHighlight({ color: "#FEF08A" })
                      .run()
                  }
                  isActive={editor.isActive("highlight")}
                  title="Highlight"
                >
                  <Highlighter className="w-4 h-4" />
                </ToolbarButton>
              </div>

              {/* Lists & Blocks */}
              <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
                <span className="text-xs font-medium text-gray-500 mr-2">
                  Lists
                </span>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  isActive={editor.isActive("bulletList")}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  isActive={editor.isActive("orderedList")}
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  isActive={editor.isActive("blockquote")}
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </ToolbarButton>
              </div>

              {/* Insert Elements */}
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-500 mr-2">
                  Insert
                </span>
                <ToolbarButton
                  onClick={setLink}
                  isActive={editor.isActive("link")}
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={addImage} title="Image">
                  <ImageIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                  title="Horizontal Rule"
                >
                  <Minus className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={addTable} title="Table">
                  <TableIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  isActive={editor.isActive("codeBlock")}
                  title="Code Block"
                >
                  <Code2 className="w-4 h-4" />
                </ToolbarButton>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>Words: {editor.storage?.characterCount?.words() || 0}</span>
              <span>
                Characters: {editor.storage?.characterCount?.characters() || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>
                Type{" "}
                <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">/</kbd>{" "}
                for commands
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        <EditorContent editor={editor} className="focus-within:outline-none" />
      </div>

      {editable && (
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded border shadow-sm">
          Type <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">/</kbd>{" "}
          for commands
        </div>
      )}
    </div>
  );
}
