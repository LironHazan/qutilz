import { Project, ts } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function grabFilesSync(currentDirPath: string): string[] {
  return fs
    .readdirSync(currentDirPath)
    .reduce((acc: string[], name: string) => {
      const filePath = path.join(currentDirPath, name);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        acc.push(filePath);
      }
      return acc;
    }, []);
}
const fgGreen = '\x1b[32m';

/**
 * Parse a test file, grab all descriptions of suites/tests from the describe() + it() expressions
 * and reformat to a report
 */
async function testsReporter(): Promise<void> {
  const project = new Project();
  const files = grabFilesSync('./'); // grab all files from local folder
  for (const filePath of files) {
    project.addSourceFileAtPath(filePath);
    const sourceFile = project.getSourceFileOrThrow(filePath);
    sourceFile
      .getDescendantsOfKind(ts.SyntaxKind.CallExpression)
      .forEach(ce => {
        ce.getDescendantsOfKind(ts.SyntaxKind.Identifier).forEach(id => {
          if (id.getText() === 'describe' || id.getText() === 'it') {
            id.getNextSiblings().forEach(sibling => {
              sibling
                .getChildrenOfKind(ts.SyntaxKind.StringLiteral)
                .forEach(str => {
                  if (id.getText() === 'describe') {
                    console.log('suite:', str.getText(), fgGreen);
                  } else {
                    console.log('test:', str.getText());
                  }
                });
            });
          }
        });
      });
  }
}

testsReporter().then();
