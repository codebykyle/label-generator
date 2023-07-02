import PDFDocument from 'pdfkit'
import doc from "pdfkit";

const MmToPointsFactor = 2.83465;
const MmToPixelFactor = 3.7795275591;

export enum Units {
    MM = 0,
    PT = 1,
    PX = 2
}

export interface InterfaceSupport {
    human_name: string
    description: string
}

export interface LabelOptions extends InterfaceSupport {

}

export interface SheetOptions extends InterfaceSupport {
    paper_size: string
    paper_margins: Dimensions
    sticker_count: Dimensions,
    label_dimensions: Dimensions,
    label_margins: Dimensions,
    margin_between: Dimensions,
}

interface DimensionOptions {
    x?: number
    y?: number
    width?: number
    height?: number
    units?: Units
}

export class Dimensions {
    public x: number = 0;
    public y: number = 0;

    public width: number = 0;
    public height: number = 0;

    public units: Units = Units.MM;

    constructor(options?: DimensionOptions) {
        this.x = options?.x ?? 0;
        this.y = options?.y ?? 0;
        this.height = options?.height ?? 0;
        this.width = options?.width ?? 0;
        this.units = options?.units ?? Units.MM;
    }

    area() {
        return this.x * this.y
    }

    add(dimensions: Dimensions | DimensionOptions): Dimensions {
        const newDimensions = this.checkDimensions(dimensions)

        newDimensions.x += dimensions.x ?? 0;
        newDimensions.y += dimensions.y ?? 0;
        newDimensions.width += dimensions.width ?? 0;
        newDimensions.height += dimensions.height ?? 0;

        return newDimensions
    }

    margin(dimensions: Dimensions | DimensionOptions): Dimensions {
        const newDimensions = this.checkDimensions(dimensions);


        return newDimensions.add({
            x: (dimensions.width ?? 0) / 2,
            y: (dimensions.height ?? 0) / 2
        }).subtract({
            width: (dimensions.width ?? 0) / 2,
            height: (dimensions.height ?? 0) / 2
        })
    }

    subtract(dimensions: Dimensions | DimensionOptions): Dimensions {
        const newDimensions = this.checkDimensions(dimensions)

        newDimensions.x -= dimensions.x ?? 0;
        newDimensions.y -= dimensions.y ?? 0;
        newDimensions.width -= dimensions.width ?? 0;
        newDimensions.height -= dimensions.height ?? 0;

        return newDimensions
    }

    multiply(dimensions: Dimensions | DimensionOptions): Dimensions {
        const newDimensions = this.checkDimensions(dimensions);

        newDimensions.x *= dimensions.x ?? 0;
        newDimensions.y *= dimensions.y ?? 0;
        newDimensions.width *= dimensions.width ?? 0;
        newDimensions.height *= dimensions.height ?? 0;

        return newDimensions
    }

    divide(dimensions: Dimensions | DimensionOptions): Dimensions {
        const newDimensions = this.checkDimensions(dimensions);

        newDimensions.x /= dimensions.x ?? 0;
        newDimensions.y /= dimensions.y ?? 0;
        newDimensions.width /= dimensions.width ?? 0;
        newDimensions.height /= dimensions.height ?? 0;

        return newDimensions
    }

    toPt(factor = MmToPointsFactor): Dimensions {
        if (this.units === Units.PT) {
            return this
        }

        const asMM = this.toMM();

        return new Dimensions({
            x: asMM.x * factor,
            y: asMM.y * factor,
            width: asMM.width * factor,
            height: asMM.height * factor,
            units: Units.PT
        })
    }

    toPx(factor = MmToPixelFactor): Dimensions {
        if (this.units === Units.PX) {
            return this
        }

        const asMM = this.toMM();

        return new Dimensions({
            x: Math.floor(asMM.x * factor),
            y: Math.floor(asMM.y * factor),
            width: Math.floor(asMM.width * factor),
            height: Math.floor(asMM.height * factor),
            units: Units.PT
        })
    }

    toMM(): Dimensions {
        let factor = MmToPointsFactor;

        if (this.units === Units.MM) {
            return this
        }

        if (this.units === Units.PX) {
            factor = MmToPixelFactor
        }

        return new Dimensions({
            x: this.x / factor,
            y: this.y / factor,
            width: this.width / factor,
            height: this.height / factor,
            units: Units.MM
        })
    }


    protected checkDimensions(dimensions: Dimensions | DimensionOptions) {
        const newDimensions = new Dimensions(this)

        if (typeof dimensions.units !== 'undefined') {
            if (dimensions.units === this.units) {
                newDimensions.units = this.units
            } else {
                throw new Error(`Dimension units do not match. Unit1: ${this.units} - Unit2: ${dimensions.units} `)
            }
        }

        return newDimensions
    }
}

export class LabelRequest {
    sheet_name: string | undefined
    items: LabelData[]

    constructor(sheet_name: string | undefined, items: LabelData[]) {
        this.sheet_name = sheet_name
        this.items = items;
    }
}

export interface LabelData {
    subtitle: string | undefined;
    title: string | undefined;
    url: string | undefined;
    barcode: string | undefined
}

export interface LabelGeneratorParams {
    data: LabelData
    dimensions: Dimensions
    request: LabelRequest
    document: PDFKit.PDFDocument
}

export abstract class Label {
    protected _params: LabelGeneratorParams | undefined;

    abstract getOptions(): LabelOptions

    public data(data: LabelGeneratorParams) {
        this._params = data;
        return this;
    }

    protected getParams(): LabelGeneratorParams {
        if (typeof this._params === 'undefined') {
            throw new Error("Tried to access params before they were set")
        }

        return this._params
    }

    abstract generate(): Promise<void>;
}

export abstract class Sheet {
    protected _labelType: typeof Label | undefined
    protected _params: LabelRequest | undefined

    abstract getOptions(): SheetOptions

    public labelType(labelType: typeof Label) {
        this._labelType = labelType
        return this;
    }

    public params(data: LabelRequest) {
        this._params = data;
        return this;
    }

    protected getParams() {
        return this._params
    }

    protected getLabelType(): typeof Label | undefined {
        return this._labelType
    }

    async generate(): Promise<typeof PDFDocument> {
        //////////////////////////
        // Setup /////////////////
        //////////////////////////
        const data = this.getParams();
        const labelType = this.getLabelType();
        const options = this.getOptions();
        const document = this.makeDocument();

        let x = 0;
        let y = 0;
        let make_page = false;

        if (typeof data === 'undefined') {
            throw new Error("No label type set for export")
        }

        if (typeof labelType === 'undefined') {
            throw new Error("No label data for export")
        }

        this.addSheetName(data.sheet_name, document);

        document.on('pageAdded', () => {
            this.addSheetName(data.sheet_name, document);
        })


        //////////////////////////
        // Generate Stickers /////
        //////////////////////////
        while (data.items.length > 0) {
            const item = data.items.shift();

            if (typeof item === 'undefined') {
                return document;
            }

            if (make_page) {
                document.addPage();
                make_page = false;
            }

            // Top left corner of this label item,
            // accounting for the label margins on both sides of the sticker
            // Calculate the margin on both sides and subtract it from the total dimension of the label,
            // then add one side of the margin, thus putting us at the top left of the internal margin
            const offset = new Dimensions()
                .add({
                    x: options.paper_margins.width,
                    y: options.paper_margins.height
                })
                .add({
                    x: (x * (options.label_dimensions.width + options.margin_between.width)),
                    y: (y * (options.label_dimensions.height + options.margin_between.height))
                })
                .add({
                    x: options.label_margins.width,
                    y: options.label_margins.height
                })
                .add(options.label_dimensions.subtract(
                    options.label_margins.multiply({
                        width: 2,
                        height: 2
                    })
                ));


            if (process.env.DEBUG?.toLowerCase() === 'true') {
                this.drawDebug(x, y, document);
            }


            // @ts-ignore
            await (new labelType())
                .data({
                    data: item,
                    document: document,
                    dimensions: offset
                })
                .generate()

            x += 1;

            if (x >= options.sticker_count.x) {
                y += 1;
                x = 0;
            }

            if (y >= options.sticker_count.y) {
                x = 0;
                y = 0;
                make_page = true
            }
        }

        return document
    }

    private addSheetName(sheet_name: string | undefined, document: PDFKit.PDFDocument) {
        const options = this.getOptions()

        const page_name_offset = options.paper_margins
            .divide(new Dimensions({
                width: 2,
                height: 2
            })).toPt()

        document
            .font('Helvetica-Bold')
            .fontSize(16)
            .text(
                sheet_name ?? "",
                page_name_offset.width,
                page_name_offset.height,
                {
                    baseline: "middle"
                }
            )
    }

    private drawDebug(x: number, y: number, document: PDFKit.PDFDocument) {
        const options = this.getOptions()

        // This is the first cell on a page.
        // Draw the page debug options
        if (x === 0 && y === 0) {
            // Draw a box around the entire page
            document.rect(0, 0, document.page.width, document.page.height)
                .stroke("#555")
                .fill("#fff")

                // Draw the top margin
                .moveTo(document.page.width / 2, 0)
                .lineTo(
                    document.page.width / 2,
                    options.paper_margins.toPt().height
                )
                .stroke('#555')
                .fill("#555")

                // Move 1 mm to the right of the line and draw the text fot the top margin
                .fontSize(6)
                .text(
                    "Top Margin",
                    (document.page.width / 2) + new Dimensions({x: 1}).toPt().x,
                    options.paper_margins.toPt().height / 2, {
                        baseline: "middle"
                    }
                )
                .fontSize(8)
                .text(`${options.paper_margins.height}mm`, {
                    baseline: "middle"
                })
                .fill('#555')

                // Draw the top margin boundary
                .moveTo(0, options.paper_margins.toPt().height)
                .lineTo(document.page.width, options.paper_margins.toPt().height)

                // Draw the left margin boundary
                .moveTo(options.paper_margins.toPt().width, 0)
                .lineTo(options.paper_margins.toPt().width, document.page.height)
                .stroke('#555')
                .fill("#555")

                // Draw the left margin text
                .fontSize(6)
                .text(
                    "Left Margin",
                    (options.paper_margins.toPt().width) + new Dimensions({x: 1}).toPt().x,
                    options.paper_margins.toPt().height / 2, {
                        baseline: "middle"
                    }
                )
                .fontSize(8)
                .text(`${options.paper_margins.width}mm`, {
                    baseline: "middle"
                })
                .fill('#555')
        }

        // Draw a debug box to see the label size and position
        const labelPosition = new Dimensions()
            .add({
                x: options.paper_margins.width,
                y: options.paper_margins.height
            })
            .add({
                x: (x * (options.label_dimensions.width + options.margin_between.width)),
                y: (y * (options.label_dimensions.height + options.margin_between.height))
            })
            .add(options.label_dimensions)
            .toPt();

        // Draw a box where this label should be
        document.rect(
            labelPosition.x,
            labelPosition.y,
            labelPosition.width,
            labelPosition.height
        ).stroke('#555').fill('#fff')
    }

    protected makeDocument(): PDFKit.PDFDocument {
        const options = this.getOptions();

        return new PDFDocument({
            size: options.paper_size,
            bufferPages: true,
            margin: 0
        });
    }
}
