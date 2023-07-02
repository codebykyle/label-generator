"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("./core/types");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT;
const availableSheets = {};
const availableLabels = {};
const defaultSheet = (_a = process.env.DEFAULT_SHEET) !== null && _a !== void 0 ? _a : 'a4_4x10';
const defaultLabel = (_b = process.env.DEFAULT_LABEL) !== null && _b !== void 0 ? _b : 'inventory';
console.log(availableSheets);
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const getOptions = (fromList) => Object.keys(fromList)
        .reduce((carry, entry) => {
        carry[entry] = (new fromList[entry]).getOptions();
        return carry;
    }, {});
    return res.send({
        defaults: {
            sheet: defaultSheet,
            label: defaultLabel
        },
        sheets: getOptions(availableSheets),
        labels: getOptions(availableLabels)
    });
}));
app.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    //////////////////////////
    // Setup /////////////////
    //////////////////////////
    const requested_sheet = (_c = req.body.sheet) !== null && _c !== void 0 ? _c : defaultSheet;
    const requested_label = (_d = req.body.label) !== null && _d !== void 0 ? _d : defaultLabel;
    console.log('available sheets', availableSheets);
    //////////////////////////
    // Validation ////////////
    //////////////////////////
    if (!(requested_sheet in availableSheets)) {
        return res.status(403).send({
            'sheet': "The selected sheet export does not exist"
        });
    }
    if (!(requested_label in availableLabels)) {
        return res.status(403).send({
            'label': "The selected label export does not exist"
        });
    }
    if (!Array.isArray(req.body.items)) {
        return res.status(403).send({
            "items": "Malformed Array"
        });
    }
    //////////////////////////
    // Parsing ///////////////
    //////////////////////////
    const labelRequest = new types_1.LabelRequest(req.body.sheet_name, req.body.items);
    console.log(labelRequest);
    // @ts-ignore;
    const sheetType = availableSheets[requested_sheet];
    // @ts-ignore;
    const labelType = availableLabels[requested_label];
    //////////////////////////
    // Export ////////////////
    //////////////////////////
    // @ts-ignore
    const generatedExportPdf = yield (new sheetType())
        .params(labelRequest)
        .labelType(labelType)
        .generate();
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
    });
    generatedExportPdf.pipe(stream);
    generatedExportPdf.end();
}));
/**
 * Load plugins and other related folders into a provided dictionary for quick loading
 * different types of sheets and labels with minimal configuration. This imports the default export
 * with the filename as the key and the type as a value
 *
 * @param path "Path to load"
 * @param obj "The object to load items into"
 */
function loadFolder(path, obj) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = fs_1.default.readdirSync(path);
        console.log('files', files);
        for (const index in files) {
            const file = files[index];
            console.log(`Loading Index: ${index} - ${file}`);
            const importedType = (yield Promise.resolve(`${path_1.default.join(path, file)}`).then(s => __importStar(require(s)))).default;
            const importedTypeOptions = new importedType().getOptions();
            obj[path_1.default.parse(file).name] = importedType;
        }
    });
}
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Loading core libraries");
    yield loadFolder(path_1.default.join(__dirname, 'core', 'sheets'), availableSheets);
    yield loadFolder(path_1.default.join(__dirname, 'core', 'labels'), availableLabels);
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
}));
