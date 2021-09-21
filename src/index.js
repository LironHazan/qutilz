"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.grabFilesSync = exports.lowerFirst = void 0;
var fs = require("fs");
var path = require("path");
var ts_morph_1 = require("ts-morph");
function lowerFirst(word) {
    return word && word.replace(word.charAt(0), word.charAt(0).toLowerCase());
}
exports.lowerFirst = lowerFirst;
/**
 * Extracts the filePaths of a local folder, one level - no nesting
 * @param currentDirPath
 */
function grabFilesSync(currentDirPath) {
    return fs
        .readdirSync(currentDirPath)
        .reduce(function (acc, name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
            acc.push(filePath);
        }
        return acc;
    }, []);
}
exports.grabFilesSync = grabFilesSync;
function setUpClassTarget(classes) {
    var target = {
        name: undefined,
        dependencies: []
    };
    classes.forEach(function (clazz) {
        target.name = clazz.getName();
        clazz.getConstructors().forEach(function (c) {
            c.getParameters().forEach(function (p) {
                return target.dependencies.push({
                    name: p.getStructure().name,
                    type: p.getStructure().type
                });
            });
        });
    });
    return target;
}
/**
 * Iterates files, traces classes and parses metadata needed for composing the test template with target instance
 * constructed of mocked instances.
 *
 * Currently targeting classes (useful with Angular components)
 * @param project
 */
function parseTargets(project) {
    var files = grabFilesSync('./'); // grab all files from local folder
    console.log('grabbed ', files);
    var targets = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var filePath = files_1[_i];
        project.addSourceFileAtPath(filePath);
        var sourceFile = project.getSourceFileOrThrow(filePath);
        var classes = sourceFile.getClasses();
        //todo: support imports
        // const imports = sourceFile.getImportDeclarations();
        // imports.forEach(imp=> {
        //   const struct = { file: filePath, imp: imp.getModuleSpecifierValue() };
        //   console.log(JSON.stringify(struct));
        // });
        var target = setUpClassTarget(classes);
        targets.push(target);
    }
    return targets;
}
function generateDependenciesTmpl(testedClass, dependencies) {
    var setUpInstances = dependencies.reduce(function (acc, dependency) {
        var normDepName = lowerFirst(dependency === null || dependency === void 0 ? void 0 : dependency.name);
        return (acc +
            ("const " + lowerFirst(dependency === null || dependency === void 0 ? void 0 : dependency.name) + "Mock = mock(" + dependency.type + ");\n  const " + normDepName + "Instance = instance(" + normDepName + "Mock);\n  \n  "));
    }, '');
    var mockedDependenciesInject = dependencies.reduce(function (acc, dependency, i) {
        var normDepName = lowerFirst(dependency === null || dependency === void 0 ? void 0 : dependency.name);
        return i < dependencies.length - 1
            ? acc + (normDepName + "Instance, ")
            : acc + (normDepName + "Instance");
    }, '');
    return setUpInstances + " const " + lowerFirst(testedClass) + " = new " + testedClass + "(" + mockedDependenciesInject + ");\n";
}
function generateSpecTmpl(name, dependenciesTmpl) {
    return "import { instance, mock, when } from 'ts-mockito';\n  \ndescribe('" + name + "', () => {\n\n  " + dependenciesTmpl + "\n  it('should test', () => {\n    expect(" + lowerFirst(name) + ").toBeTruthy();\n  });\n});\n";
}
/**
 * Entry point
 */
function generateSpecs() {
    return __awaiter(this, void 0, void 0, function () {
        var project, targets, _loop_1, _i, targets_1, target;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\x1b[33m%s\x1b[0m', 'Starting! ❤️'); // yellow logging :)
                    project = new ts_morph_1.Project();
                    targets = parseTargets(project).filter(function (t) { return t === null || t === void 0 ? void 0 : t.name; });
                    console.log('Generating specs for: ', targets.reduce(function (acc, t) {
                        acc.push(t.name);
                        return acc;
                    }, []));
                    _loop_1 = function (target) {
                        var name_1, dependencies, dependenciesTmpl, tName, template, specFile;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    name_1 = target.name, dependencies = target.dependencies;
                                    dependenciesTmpl = (dependencies === null || dependencies === void 0 ? void 0 : dependencies.length) > 0
                                        ? generateDependenciesTmpl(name_1, dependencies)
                                        : "const " + lowerFirst(name_1) + " = new " + name_1 + "();";
                                    tName = name_1 + ".spec.ts";
                                    template = generateSpecTmpl(name_1, dependenciesTmpl);
                                    specFile = project.createSourceFile(tName, function (writer) {
                                        return writer.writeLine(template);
                                    });
                                    return [4 /*yield*/, specFile.save()];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, targets_1 = targets;
                    _a.label = 1;
                case 1:
                    if (!(_i < targets_1.length)) return [3 /*break*/, 4];
                    target = targets_1[_i];
                    return [5 /*yield**/, _loop_1(target)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, void 0];
            }
        });
    });
}
generateSpecs()
    .then()["catch"](function (e) { return console.log(e); });
