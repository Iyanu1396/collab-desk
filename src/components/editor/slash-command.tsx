import { Extension, Editor, Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
  SuggestionProps,
  SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Image,
  Code,
  Table,
  Quote,
  Link,
  Globe,
  Search,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";

interface SlashCommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: Editor, range: Range) => void;
  keywords?: string[];
}

interface SuggestionCommandProps {
  editor: Editor;
  range: Range;
  props: SlashCommandItem;
}

const SlashCommandsList = forwardRef((props: SuggestionProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cmsArticles, setCmsArticles] = useState<any[]>([]);
  const [loadingCms, setLoadingCms] = useState(false);

  const basicCommands: SlashCommandItem[] = [
    {
      title: "Text",
      description: "Just start typing with plain text",
      icon: <Type className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
      },
      keywords: ["p", "paragraph", "text"],
    },
    {
      title: "Heading 1",
      description: "Big section heading",
      icon: <Heading1 className="w-4 h-4" />,
      command: (editor, range) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 1 })
          .run();
      },
      keywords: ["h1", "heading", "title"],
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: <Heading2 className="w-4 h-4" />,
      command: (editor, range) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 2 })
          .run();
      },
      keywords: ["h2", "heading", "subtitle"],
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: <Heading3 className="w-4 h-4" />,
      command: (editor, range) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleHeading({ level: 3 })
          .run();
      },
      keywords: ["h3", "heading"],
    },
    {
      title: "Bullet List",
      description: "Create a simple bullet list",
      icon: <List className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
      keywords: ["ul", "bullet", "list"],
    },
    {
      title: "Numbered List",
      description: "Create a list with numbering",
      icon: <ListOrdered className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
      keywords: ["ol", "numbered", "list"],
    },
    {
      title: "Quote",
      description: "Capture a quote",
      icon: <Quote className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
      keywords: ["quote", "blockquote", "citation"],
    },
    {
      title: "Code Block",
      description: "Capture a code snippet",
      icon: <Code className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
      keywords: ["code", "codeblock", "snippet"],
    },
    {
      title: "Table",
      description: "Add a simple table",
      icon: <Table className="w-4 h-4" />,
      command: (editor, range) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
      keywords: ["table", "grid"],
    },
    {
      title: "Divider",
      description: "Visually divide blocks",
      icon: <Minus className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
      keywords: ["hr", "horizontal", "rule", "divider"],
    },
    {
      title: "Image",
      description: "Upload an image from your computer",
      icon: <Image className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        const url = window.prompt("Enter the URL of the image:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      keywords: ["img", "image", "photo", "picture"],
    },
    {
      title: "Link",
      description: "Add a link",
      icon: <Link className="w-4 h-4" />,
      command: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        const url = window.prompt("Enter the URL:");
        if (url) {
          editor.chain().focus().setLink({ href: url }).run();
        }
      },
      keywords: ["link", "url"],
    },
    {
      title: "CMS Articles",
      description: "Search and embed Dev.to articles",
      icon: <Globe className="w-4 h-4" />,
      command: async () => {
        setLoadingCms(true);
        try {
          const response = await fetch("/api/cms/articles?limit=10");
          if (response.ok) {
            const data = await response.json();
            setCmsArticles(data.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch CMS articles:", error);
        } finally {
          setLoadingCms(false);
        }
      },
      keywords: ["cms", "articles", "devto", "blog", "embed"],
    },
  ];

  const cmsCommands: SlashCommandItem[] = cmsArticles.map((article) => ({
    title: article.title,
    description: `By ${article.user?.name || "Unknown"} • ${
      article.published_at
        ? new Date(article.published_at).toLocaleDateString()
        : ""
    }`,
    icon: <FileText className="w-4 h-4" />,
    command: (editor, range) => {
      editor.chain().focus().deleteRange(range).run();
      const embedHtml = `
        <div class="cms-embed border border-gray-200 rounded-lg p-4 my-4 bg-gray-50">
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <h3 class="font-semibold text-lg mb-2 text-gray-900">${
                article.title
              }</h3>
              <p class="text-gray-600 text-sm mb-3">${
                article.description || ""
              }</p>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>By ${article.user?.name || "Unknown"}</span>
                <span>•</span>
                <span>${
                  article.published_at
                    ? new Date(article.published_at).toLocaleDateString()
                    : ""
                }</span>
                <span>•</span>
                <a href="${
                  article.url
                }" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                  Read on Dev.to
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      editor.chain().focus().insertContent(embedHtml).run();
      setCmsArticles([]); // Clear after selection
    },
    keywords: ["article", "devto", article.title.toLowerCase()],
  }));

  const allCommands = [...basicCommands, ...cmsCommands];

  const filteredCommands = allCommands.filter((item) => {
    const query = props.query?.toLowerCase() || "";
    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.keywords?.some((keyword) => keyword.includes(query))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.query]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex(
          (selectedIndex + filteredCommands.length - 1) %
            filteredCommands.length
        );
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % filteredCommands.length);
        return true;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command && props.range) {
          command.command(props.editor, props.range);
          return true;
        }
      }

      return false;
    },
  }));

  if (filteredCommands.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm"
      >
        <div className="flex items-center gap-2 text-gray-500">
          <Search className="w-4 h-4" />
          <span className="text-sm">
            No commands found for &quot;{props.query}&quot;
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm max-h-80 overflow-y-auto"
    >
      {loadingCms && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm">Loading CMS articles...</span>
          </div>
        </div>
      )}

      {cmsArticles.length > 0 && (
        <div className="p-2 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-500 px-2 py-1">
            📰 CMS Articles
          </div>
        </div>
      )}

      {filteredCommands.map((item, index) => (
        <button
          key={`${item.title}-${index}`}
          type="button"
          onClick={() => {
            if (props.range) {
              item.command(props.editor, props.range);
            }
          }}
          className={`w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-start gap-3 border-0 ${
            index === selectedIndex
              ? "bg-blue-50 border-r-2 border-blue-500"
              : ""
          }`}
        >
          <div className="mt-0.5 text-gray-600 flex-shrink-0">{item.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">
              {item.title}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {item.description}
            </div>
          </div>
        </button>
      ))}
    </motion.div>
  );
});

SlashCommandsList.displayName = "SlashCommandsList";

export default Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }: SuggestionCommandProps) => {
          props.command(editor, range);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        render: () => {
          let component: ReactRenderer;
          let popup: HTMLDivElement;

          return {
            onStart: (props: SuggestionProps) => {
              component = new ReactRenderer(SlashCommandsList, {
                props: { ...props, range: props.range },
                editor: props.editor,
              });

              popup = document.createElement("div");
              popup.style.position = "absolute";
              popup.style.zIndex = "1000";
              popup.style.maxWidth = "400px";
              popup.style.pointerEvents = "auto";
              document.body.appendChild(popup);
              popup.appendChild(component.element);

              // Position the popup
              const updatePosition = () => {
                if (props.clientRect) {
                  const rect = props.clientRect();
                  if (rect && popup) {
                    popup.style.top = `${rect.bottom + window.scrollY + 8}px`;
                    popup.style.left = `${rect.left + window.scrollX}px`;
                  }
                }
              };
              updatePosition();
            },

            onUpdate: (props: SuggestionProps) => {
              component.updateProps({ ...props, range: props.range });
              // Update position
              if (props.clientRect) {
                const rect = props.clientRect();
                if (rect && popup) {
                  popup.style.top = `${rect.bottom + window.scrollY + 8}px`;
                  popup.style.left = `${rect.left + window.scrollX}px`;
                }
              }
            },

            onKeyDown: (props: SuggestionKeyDownProps) => {
              if (props.event.key === "Escape") {
                component.destroy();
                return true;
              }
              return (component.ref as any)?.onKeyDown(props) || false;
            },

            onExit: () => {
              if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup);
              }
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
