import {Identifier, Project, ts} from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively grab all files
 * @param currentDirPath
 */
function grabFilesSync(currentDirPath: string): string[] {
    const files: string[] = [];

    const walker = (_path: string, cb: (path: string) => void) => {
        fs.readdirSync(_path).forEach((name: string) => {
            const filePath = path.join(_path, name);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
                if (filePath.match(/.*.spec.ts|.*.test.ts/)) {
                    cb(filePath);
                }
            } else if (stat.isDirectory()) {
                walker(filePath, cb);
            }
        });
    };

    walker(currentDirPath, (filePath) => {
        files.push(filePath);
    });
    return files;
}

/**
 * Parse a test file, grab all descriptions of suites/tests from the describe() + it() expressions
 * and reformat to a report
 */
async function testsReporter(): Promise<void> {
    const files = grabFilesSync('./'); // grab all files from local folder
    const tests: Set<string> = new Set();
    const addTest = <T extends { getText: () => string }>(str: T, id: Identifier, tests: Set<string>) => {
        if (id.getText() === 'describe') {
            tests.add(`[suite]: ${str.getText()}`)
        }
        else if (id.getText() === 'it') {
            tests.add(`[test]: ${str.getText()}`);
        }
    }
    const project = new Project();
    for (const filePath of files) {
        console.log('Making a report for: ', filePath);
        project.addSourceFileAtPath(filePath);
        const sourceFile = project.getSourceFileOrThrow(filePath);
        sourceFile.getDescendantsOfKind(ts.SyntaxKind.CallExpression).forEach((ce) => {
            ce.getDescendantsOfKind(ts.SyntaxKind.Identifier)
                .filter(id => id.getText() === 'describe' || id.getText() === 'it')
                .forEach((id) => {


                    id.getNextSiblings()
                        .forEach((sibling) => {
                        sibling.getChildrenOfKind(ts.SyntaxKind.StringLiteral)
                            .forEach((str) => addTest(str, id, tests));
                    });

                    id.getNextSiblings()
                        .forEach((sibling) => {
                        sibling.getChildrenOfKind(ts.SyntaxKind.NoSubstitutionTemplateLiteral)
                            .forEach((str) => addTest(str, id, tests));
                    });
            });
        });
    }
    const total = Array.from(tests).filter(test => test.includes('[test]')).length;
    const print = `Total: ${total} tests:
    ${Array.from(tests).join('\n')}`;
    const specFile = project.createSourceFile('tests_report.txt', writer =>
        writer.writeLine(print)
    );
    await specFile.save();
}

testsReporter().then();
