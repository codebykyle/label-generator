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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sheet = exports.Label = exports.LabelRequest = exports.Dimensions = exports.Units = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const MmToPointsFactor = 2.83465;
const MmToPixelFactor = 3.7795275591;
var Units;
(function (Units) {
    Units[Units["MM"] = 0] = "MM";
    Units[Units["PT"] = 1] = "PT";
    Units[Units["PX"] = 2] = "PX";
})(Units = exports.Units || (exports.Units = {}));
class Dimensions {
    constructor(options) {
        var _a, _b, _c, _d, _e;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.units = Units.MM;
        this.x = (_a = options === null || options === void 0 ? void 0 : options.x) !== null && _a !== void 0 ? _a : 0;
        this.y = (_b = options === null || options === void 0 ? void 0 : options.y) !== null && _b !== void 0 ? _b : 0;
        this.height = (_c = options === null || options === void 0 ? void 0 : options.height) !== null && _c !== void 0 ? _c : 0;
        this.width = (_d = options === null || options === void 0 ? void 0 : options.width) !== null && _d !== void 0 ? _d : 0;
        this.units = (_e = options === null || options === void 0 ? void 0 : options.units) !== null && _e !== void 0 ? _e : Units.MM;
    }
    area() {
        return this.x * this.y;
    }
    add(dimensions) {
        var _a, _b, _c, _d;
        const newDimensions = this.checkDimensions(dimensions);
        newDimensions.x += (_a = dimensions.x) !== null && _a !== void 0 ? _a : 0;
        newDimensions.y += (_b = dimensions.y) !== null && _b !== void 0 ? _b : 0;
        newDimensions.width += (_c = dimensions.width) !== null && _c !== void 0 ? _c : 0;
        newDimensions.height += (_d = dimensions.height) !== null && _d !== void 0 ? _d : 0;
        return newDimensions;
    }
    margin(dimensions) {
        var _a, _b, _c, _d;
        const newDimensions = this.checkDimensions(dimensions);
        return newDimensions.add({
            x: ((_a = dimensions.width) !== null && _a !== void 0 ? _a : 0) / 2,
            y: ((_b = dimensions.height) !== null && _b !== void 0 ? _b : 0) / 2
        }).subtract({
            width: ((_c = dimensions.width) !== null && _c !== void 0 ? _c : 0) / 2,
            height: ((_d = dimensions.height) !== null && _d !== void 0 ? _d : 0) / 2
        });
    }
    subtract(dimensions) {
        var _a, _b, _c, _d;
        const newDimensions = this.checkDimensions(dimensions);
        newDimensions.x -= (_a = dimensions.x) !== null && _a !== void 0 ? _a : 0;
        newDimensions.y -= (_b = dimensions.y) !== null && _b !== void 0 ? _b : 0;
        newDimensions.width -= (_c = dimensions.width) !== null && _c !== void 0 ? _c : 0;
        newDimensions.height -= (_d = dimensions.height) !== null && _d !== void 0 ? _d : 0;
        return newDimensions;
    }
    multiply(dimensions) {
        var _a, _b, _c, _d;
        const newDimensions = this.checkDimensions(dimensions);
        newDimensions.x *= (_a = dimensions.x) !== null && _a !== void 0 ? _a : 0;
        newDimensions.y *= (_b = dimensions.y) !== null && _b !== void 0 ? _b : 0;
        newDimensions.width *= (_c = dimensions.width) !== null && _c !== void 0 ? _c : 0;
        newDimensions.height *= (_d = dimensions.height) !== null && _d !== void 0 ? _d : 0;
        return newDimensions;
    }
    divide(dimensions) {
        var _a, _b, _c, _d;
        const newDimensions = this.checkDimensions(dimensions);
        newDimensions.x /= (_a = dimensions.x) !== null && _a !== void 0 ? _a : 0;
        newDimensions.y /= (_b = dimensions.y) !== null && _b !== void 0 ? _b : 0;
        newDimensions.width /= (_c = dimensions.width) !== null && _c !== void 0 ? _c : 0;
        newDimensions.height /= (_d = dimensions.height) !== null && _d !== void 0 ? _d : 0;
        return newDimensions;
    }
    toPt(factor = MmToPointsFactor) {
        if (this.units === Units.PT) {
            return this;
        }
        const asMM = this.toMM();
        return new Dimensions({
            x: asMM.x * factor,
            y: asMM.y * factor,
            width: asMM.width * factor,
            height: asMM.height * factor,
            units: Units.PT
        });
    }
    toPx(factor = MmToPixelFactor) {
        if (this.units === Units.PX) {
            return this;
        }
        const asMM = this.toMM();
        return new Dimensions({
            x: Math.floor(asMM.x * factor),
            y: Math.floor(asMM.y * factor),
            width: Math.floor(asMM.width * factor),
            height: Math.floor(asMM.height * factor),
            units: Units.PT
        });
    }
    toMM() {
        let factor = MmToPointsFactor;
        if (this.units === Units.MM) {
            return this;
        }
        if (this.units === Units.PX) {
            factor = MmToPixelFactor;
        }
        return new Dimensions({
            x: this.x / factor,
            y: this.y / factor,
            width: this.width / factor,
            height: this.height / factor,
            units: Units.MM
        });
    }
    checkDimensions(dimensions) {
        const newDimensions = new Dimensions(this);
        if (typeof dimensions.units !== 'undefined') {
            if (dimensions.units === this.units) {
                newDimensions.units = this.units;
            }
            else {
                throw new Error(`Dimension units do not match. Unit1: ${this.units} - Unit2: ${dimensions.units} `);
            }
        }
        return newDimensions;
    }
}
exports.Dimensions = Dimensions;
class LabelRequest {
    constructor(sheet_name, items) {
        this.sheet_name = sheet_name;
        this.items = items;
    }
}
exports.LabelRequest = LabelRequest;
class Label {
    data(data) {
        this._params = data;
        return this;
    }
    getParams() {
        if (typeof this._params === 'undefined') {
            throw new Error("Tried to access params before they were set");
        }
        return this._params;
    }
}
exports.Label = Label;
class Sheet {
    labelType(labelType) {
        this._labelType = labelType;
        return this;
    }
    params(data) {
        this._params = data;
        return this;
    }
    getParams() {
        return this._params;
    }
    getLabelType() {
        return this._labelType;
    }
    generate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
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
                throw new Error("No label type set for export");
            }
            if (typeof labelType === 'undefined') {
                throw new Error("No label data for export");
            }
            this.addSheetName(data.sheet_name, document);
            document.on('pageAdded', () => {
                this.addSheetName(data.sheet_name, document);
            });
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
                    .add(options.label_dimensions.subtract(options.label_margins.multiply({
                    width: 2,
                    height: 2
                })));
                if (((_a = process.env.DEBUG) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === 'true') {
                    this.drawDebug(x, y, document);
                }
                // @ts-ignore
                yield (new labelType())
                    .data({
                    data: item,
                    document: document,
                    dimensions: offset
                })
                    .generate();
                x += 1;
                if (x >= options.sticker_count.x) {
                    y += 1;
                    x = 0;
                }
                if (y >= options.sticker_count.y) {
                    x = 0;
                    y = 0;
                    make_page = true;
                }
            }
            return document;
        });
    }
    addSheetName(sheet_name, document) {
        const options = this.getOptions();
        const page_name_offset = options.paper_margins
            .divide(new Dimensions({
            width: 2,
            height: 2
        })).toPt();
        document
            .font('Helvetica-Bold')
            .fontSize(16)
            .text(sheet_name !== null && sheet_name !== void 0 ? sheet_name : "", page_name_offset.width, page_name_offset.height, {
            baseline: "middle"
        });
    }
    drawDebug(x, y, document) {
        const options = this.getOptions();
        // This is the first cell on a page.
        // Draw the page debug options
        if (x === 0 && y === 0) {
            // Draw a box around the entire page
            document.rect(0, 0, document.page.width, document.page.height)
                .stroke("#555")
                .fill("#fff")
                // Draw the top margin
                .moveTo(document.page.width / 2, 0)
                .lineTo(document.page.width / 2, options.paper_margins.toPt().height)
                .stroke('#555')
                .fill("#555")
                // Move 1 mm to the right of the line and draw the text fot the top margin
                .fontSize(6)
                .text("Top Margin", (document.page.width / 2) + new Dimensions({ x: 1 }).toPt().x, options.paper_margins.toPt().height / 2, {
                baseline: "middle"
            })
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
                .text("Left Margin", (options.paper_margins.toPt().width) + new Dimensions({ x: 1 }).toPt().x, options.paper_margins.toPt().height / 2, {
                baseline: "middle"
            })
                .fontSize(8)
                .text(`${options.paper_margins.width}mm`, {
                baseline: "middle"
            })
                .fill('#555');
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
        document.rect(labelPosition.x, labelPosition.y, labelPosition.width, labelPosition.height).stroke('#555').fill('#fff');
    }
    makeDocument() {
        const options = this.getOptions();
        return new pdfkit_1.default({
            size: options.paper_size,
            bufferPages: true,
            margin: 0
        });
    }
}
exports.Sheet = Sheet;
