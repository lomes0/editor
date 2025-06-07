import { createHeadlessEditor } from '@lexical/headless';
import { editorConfig } from '@/editor/config';
import { $generateHtmlFromNodes } from '@lexical/html';

// Convert Lexical JSON to HTML string
export async function renderLexicalToHtml(lexicalJson: any): Promise<string> {
  const editor = createHeadlessEditor(editorConfig);
  const editorState = editor.parseEditorState(lexicalJson);
  editor.setEditorState(editorState);
  return editorState.read(() => $generateHtmlFromNodes(editor));
}
