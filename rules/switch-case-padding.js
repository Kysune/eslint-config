module.exports = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    messages: {
      expectedBlankLine: 'Expected a blank line between case blocks.',
      noBlankLineFallthrough: 'Unexpected blank line between fall-through cases.'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
      SwitchStatement(node) {
        const cases = node.cases;
        if (cases.length < 2) return;

        // 1. Check if the switch is "compact" (all cases/default are single-line)
        const isCompactSwitch = cases.every(c => {
          // A case is considered single-line if its start and end are on the same line
          return c.loc.start.line === c.loc.end.line;
        });

        // If every case is on a single line, we don't enforce any padding
        if (isCompactSwitch) return;

        // 2. If the switch is not compact, apply padding logic between cases
        for (let i = 0; i < cases.length - 1; i++) {
          const currentCase = cases[i];
          const nextCase = cases[i + 1];

          const textBetween = sourceCode.text.slice(currentCase.range[1], nextCase.range[0]);
          const lines = textBetween.split('\n');
          const blankLinesCount = lines.slice(1, -1).filter(line => line.trim() === '').length;

          const isFallthrough = currentCase.consequent.length === 0;

          if (!isFallthrough) {
            // Case has code: Require at least one blank line before the next case
            if (blankLinesCount === 0) {
              context.report({
                node: nextCase,
                messageId: 'expectedBlankLine',
                fix(fixer) {
                  const lastToken = sourceCode.getLastToken(currentCase);
                  return fixer.insertTextAfter(lastToken, '\n');
                }
              });
            }
          } else {
            // Fall-through case: Prohibit blank lines between them (comments are allowed)
            if (blankLinesCount > 0) {
              context.report({
                node: nextCase,
                messageId: 'noBlankLineFallthrough',
                fix(fixer) {
                  const fixedText = textBetween.replace(/\n\s*\n/g, '\n');
                  return fixer.replaceTextRange([currentCase.range[1], nextCase.range[0]], fixedText);
                }
              });
            }
          }
        }
      }
    };
  }
};
