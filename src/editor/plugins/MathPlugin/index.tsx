"use client"
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $createParagraphNode, $insertNodes, $isRootNode, LexicalCommand, TextNode } from 'lexical';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { useEffect } from 'react';
import { $wrapNodeInElement } from '@lexical/utils';

import { $createMathNode, MathNode } from '../../nodes/MathNode';
import { IS_MOBILE } from '../../shared/environment';

type CommandPayload = {
  value: string;
};

export const INSERT_MATH_COMMAND: LexicalCommand<CommandPayload> =
  createCommand();

export default function MathPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([MathNode])) {
      throw new Error(
        'MathPlugin: MathNode not registered on editor',
      );
    }

    return editor.registerCommand<CommandPayload>(
      INSERT_MATH_COMMAND,
      (payload) => {
        const { value } = payload;
        const mathNode = $createMathNode(value);
        $insertNodes([mathNode]);
        if ($isRootNode(mathNode.getParentOrThrow())) {
          $wrapNodeInElement(mathNode, $createParagraphNode);
        }
        mathNode.select();
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  useEffect(() => {
    const navigation = (window as any).navigation;
    if (!navigation || !IS_MOBILE) return;

    const preventBackNavigation = (event: any) => {
      if (event.navigationType === 'push') return;
      const mathVirtualKeyboard = window.mathVirtualKeyboard;
      if (!mathVirtualKeyboard?.visible) return;
      event.preventDefault();
      mathVirtualKeyboard.hide();
    };

    navigation.addEventListener('navigate', preventBackNavigation);
    return () => {
      navigation.removeEventListener('navigate', preventBackNavigation);
    };
  }, []);

  return null;
}
