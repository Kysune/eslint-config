'use strict';
// Warning! AI-generated file

/**
 * Extracts the effective callee of a decorator.
 * Handles:
 *  - @X()                -> CallExpression(Identifier)
 *  - @NS.X()             -> CallExpression(MemberExpression)
 *  - @X                  -> Identifier
 */
function getDecoratorCallee(expr) {
  if (!expr) return null;

  if (expr.type === 'CallExpression') {
    return expr.callee;
  }

  return expr; // Identifier or MemberExpression
}

/**
 * Checks if decorator matches one of named imports.
 */
function isNamedDecorator(dec, namesSet) {
  const callee = getDecoratorCallee(dec.expression);
  if (!callee) return false;

  if (callee.type === 'Identifier') {
    return namesSet.has(callee.name);
  }

  return false;
}

/**
 * Checks if decorator comes from a namespace import.
 * Example:
 *   import * as CT from 'class-transformer'
 *   @CT.Transform()
 */
function isNamespacedDecorator(dec, namespaceImportsSet) {
  const callee = getDecoratorCallee(dec.expression);
  if (!callee) return false;

  if (callee.type === 'MemberExpression' && !callee.computed) {
    const obj = callee.object;

    if (obj?.type === 'Identifier' && namespaceImportsSet.has(obj.name)) {
      return true;
    }
  }

  return false;
}

function isTransformerDecorator(dec, transformerNamed, transformerNamespace) {
  return (
    isNamedDecorator(dec, transformerNamed) ||
    isNamespacedDecorator(dec, transformerNamespace)
  );
}

function isValidatorDecorator(dec, validatorNamed, validatorNamespace) {
  return (
    isNamedDecorator(dec, validatorNamed) ||
    isNamespacedDecorator(dec, validatorNamespace)
  );
}

/**
 * Builds text segments for decorators including trailing whitespace
 * so they can be safely reordered.
 */
function buildDecoratorSegments(sourceCode, decorators) {
  const segments = [];

  for (let i = 0; i < decorators.length; i++) {
    const current = decorators[i];
    const next = decorators[i + 1];

    const start = current.range[0];
    const end = next ? next.range[0] : current.range[1];

    segments.push({
      node: current,
      start,
      end,
      text: sourceCode.text.slice(start, end),
    });
  }

  return segments;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure all class-transformer decorators appear before class-validator decorators on DTO properties.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      mustBeBefore:
        'Decorators from class-transformer must appear before class-validator decorators (transformation runs before validation).',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    // Named imports: import { Transform } from 'class-transformer'
    const transformerNamedImports = new Set();
    const validatorNamedImports = new Set();

    // Namespace imports: import * as CT from 'class-transformer'
    const transformerNamespaceImports = new Set();
    const validatorNamespaceImports = new Set();

    function collectImports(node) {
      const source = node.source?.value;

      if (source === 'class-transformer') {
        for (const spec of node.specifiers || []) {
          if (spec.type === 'ImportSpecifier') {
            transformerNamedImports.add(spec.local.name);
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            transformerNamespaceImports.add(spec.local.name);
          }
        }
      }

      if (source === 'class-validator') {
        for (const spec of node.specifiers || []) {
          if (spec.type === 'ImportSpecifier') {
            validatorNamedImports.add(spec.local.name);
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            validatorNamespaceImports.add(spec.local.name);
          }
        }
      }
    }

    function checkDecorators(node) {
      const decorators = node.decorators;
      if (!decorators || decorators.length < 2) return;

      // Find first validator decorator
      const firstValidatorIndex = decorators.findIndex((d) =>
        isValidatorDecorator(d, validatorNamedImports, validatorNamespaceImports)
      );

      if (firstValidatorIndex === -1) return;

      // Check if any transformer decorator appears after a validator
      const hasTransformerAfterValidator = decorators.some(
        (d, idx) =>
          idx > firstValidatorIndex &&
          isTransformerDecorator(
            d,
            transformerNamedImports,
            transformerNamespaceImports
          )
      );

      if (!hasTransformerAfterValidator) return;

      const offendingIndex = decorators.findIndex(
        (d, idx) =>
          idx > firstValidatorIndex &&
          isTransformerDecorator(
            d,
            transformerNamedImports,
            transformerNamespaceImports
          )
      );

      context.report({
        node: decorators[offendingIndex],
        messageId: 'mustBeBefore',
        fix(fixer) {
          try {
            const segments = buildDecoratorSegments(sourceCode, decorators);

            const blockStart = segments[0].start;
            const blockEnd = segments[segments.length - 1].end;

            const lateTransformers = [];
            const remaining = [];

            for (let i = 0; i < segments.length; i++) {
              const isTransformer = isTransformerDecorator(
                decorators[i],
                transformerNamedImports,
                transformerNamespaceImports
              );

              if (i > firstValidatorIndex && isTransformer) {
                lateTransformers.push(segments[i]);
              } else {
                remaining.push(segments[i]);
              }
            }

            if (lateTransformers.length === 0) return null;

            const firstValidatorNode = decorators[firstValidatorIndex];
            const insertAt = remaining.findIndex(
              (s) => s.node === firstValidatorNode
            );

            if (insertAt === -1) return null;

            const reordered = [
              ...remaining.slice(0, insertAt),
              ...lateTransformers,
              ...remaining.slice(insertAt),
            ];

            const newBlockText = reordered.map((s) => s.text).join('');

            return fixer.replaceTextRange(
              [blockStart, blockEnd],
              newBlockText
            );
          } catch {
            return null;
          }
        },
      });
    }

    return {
      ImportDeclaration: collectImports,
      PropertyDefinition: checkDecorators,
      ClassProperty: checkDecorators,
    };
  },
};
