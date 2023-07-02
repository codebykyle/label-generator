import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import {Sheet as AFourFourByTen} from './core/sheets/a4_4x10'
import {Label, LabelRequest, Sheet, SheetOptions} from "./core/types";
import {Label as InventoryLabel} from './core/labels/inventory'
import Fs from "fs";
import Path from "path"

dotenv.config()

const app: Express = express();
app.use(express.json());

const port = process.env.PORT;

const availableSheets: { [key: string]: Sheet } = {};
const availableLabels: { [key: string]: Label } = {};

const defaultSheet = process.env.DEFAULT_SHEET ?? 'a4_4x10'
const defaultLabel = process.env.DEFAULT_LABEL ?? 'inventory'


console.log(availableSheets);

app.get('/', async (req: Request, res: Response) => {
    const getOptions = (fromList: { [key: string]: any }) => Object.keys(fromList)
        .reduce((carry: { [key: string]: any }, entry: string) => {
            carry[entry] = (new fromList[entry]).getOptions()
            return carry
        }, {});


    return res.send({
        defaults: {
            sheet: defaultSheet,
            label: defaultLabel
        },
        sheets: getOptions(availableSheets),
        labels: getOptions(availableLabels)
    })
});

app.post('/', async (req: Request, res: Response) => {
    //////////////////////////
    // Setup /////////////////
    //////////////////////////
    const requested_sheet = req.body.sheet ?? defaultSheet
    const requested_label = req.body.label ?? defaultLabel

    console.log('available sheets', availableSheets)

    //////////////////////////
    // Validation ////////////
    //////////////////////////
    if (!(requested_sheet in availableSheets)) {
        return res.status(403).send({
            'sheet': "The selected sheet export does not exist"
        })
    }

    if (!(requested_label in availableLabels)) {
        return res.status(403).send({
            'label': "The selected label export does not exist"
        })
    }

    if (!Array.isArray(req.body.items)) {
        return res.status(403).send({
            "items": "Malformed Array"
        })
    }

    //////////////////////////
    // Parsing ///////////////
    //////////////////////////

    const labelRequest = new LabelRequest(
        req.body.sheet_name,
        req.body.items
    )

    console.log(labelRequest)

    // @ts-ignore;
    const sheetType = availableSheets[requested_sheet];

    // @ts-ignore;
    const labelType = availableLabels[requested_label];


    //////////////////////////
    // Export ////////////////
    //////////////////////////
    // @ts-ignore
    const generatedExportPdf = await (new sheetType())
        .params(labelRequest)
        .labelType(labelType)
        .generate()

    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
    });

    generatedExportPdf.pipe(stream)
    generatedExportPdf.end();
})


/**
 * Load plugins and other related folders into a provided dictionary for quick loading
 * different types of sheets and labels with minimal configuration. This imports the default export
 * with the filename as the key and the type as a value
 *
 * @param path "Path to load"
 * @param obj "The object to load items into"
 */
async function loadFolder(path: string, obj: { [key: string]: any }): Promise<void> {
    const files = Fs.readdirSync(path);
    console.log('files', files);

    for (const index in files) {
        const file = files[index];
        console.log(`Loading Index: ${index} - ${file}`)
        const importedType = (await import(Path.join(path, file))).default
        const importedTypeOptions = new importedType().getOptions();
        obj[Path.parse(file).name] = importedType;
    }
}

app.listen(port, async () => {
    console.log("Loading core libraries")
    await loadFolder(Path.join(__dirname, 'core', 'sheets'), availableSheets)
    await loadFolder(Path.join(__dirname, 'core', 'labels'), availableLabels)

    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
})
