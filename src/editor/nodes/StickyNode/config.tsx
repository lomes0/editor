import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "../TableNode";
import { ListItemNode, ListNode } from "../ListNode";
import { CodeHighlightNode, CodeNode } from "../CodeNode";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "@/editor/nodes/HorizontalRuleNode";
import { MathNode } from "../MathNode";
import { ImageNode } from "../ImageNode";
import { SketchNode } from '../SketchNode';
import { GraphNode } from '../GraphNode';
import theme from "../../theme";
import { IFrameNode } from "../IFrameNode";
import { LayoutContainerNode, LayoutItemNode } from "../LayoutNode";

export const editorConfig = {
  namespace: "matheditor",
  // The editor theme
  theme: theme,
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    HorizontalRuleNode,
    MathNode,
    ImageNode,
    SketchNode,
    GraphNode,
    IFrameNode,
    LayoutContainerNode,
    LayoutItemNode,
  ]
};
