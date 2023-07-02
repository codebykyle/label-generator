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
exports.Label = void 0;
const types_1 = require("../types");
const qrcode_1 = __importDefault(require("qrcode"));
const canvas_1 = require("canvas");
const jsbarcode_1 = __importDefault(require("jsbarcode"));
class Label extends types_1.Label {
    getOptions() {
        return {
            human_name: "Inventory Label",
            description: "An inventory label with a QR code, text area, and barcode"
        };
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.makeDebugBox();
            yield this.makeQRCode();
            this.makeLabel();
            this.makeBarCode();
        });
    }
    layout() {
        const params = this.getParams();
        const bottomSize = params.dimensions.height * 0.33;
        const top = new types_1.Dimensions({
            x: params.dimensions.x,
            y: params.dimensions.y,
            width: params.dimensions.width,
            height: params.dimensions.height - bottomSize
        });
        const bottom = new types_1.Dimensions({
            x: params.dimensions.x,
            y: params.dimensions.y + top.height,
            height: bottomSize,
            width: params.dimensions.width,
        });
        const qr = new types_1.Dimensions({
            x: params.dimensions.x,
            y: params.dimensions.y,
            height: top.width * 0.33,
            width: top.width * 0.33
        });
        const text = new types_1.Dimensions({
            x: params.dimensions.x + qr.width,
            y: params.dimensions.y,
            width: params.dimensions.width - qr.width,
            height: top.height
        });
        return {
            top,
            bottom,
            qr,
            text
        };
    }
    makeLabel() {
        var _a, _b;
        const params = this.getParams();
        const layout = this.layout();
        const dAsPoints = layout.text.toPt();
        params.document
            .font('Helvetica')
            .fill('#000')
            .fontSize(6)
            .text((_a = params.data.subtitle) !== null && _a !== void 0 ? _a : "", dAsPoints.x, dAsPoints.y, {
            width: dAsPoints.width,
            ellipsis: true,
            lineBreak: true
        })
            .font('Helvetica-Bold')
            .fontSize(12)
            .text((_b = params.data.title) !== null && _b !== void 0 ? _b : "", {
            width: dAsPoints.width,
            ellipsis: true,
            height: dAsPoints.height,
            lineBreak: true
        });
    }
    makeQRCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const params = this.getParams();
            if (!params.data.url) {
                return;
            }
            const layout = this.layout();
            const dAsPoints = layout.qr.toPt();
            params.document.image(yield qrcode_1.default.toBuffer(params.data.url, {
                errorCorrectionLevel: "M",
                margin: 2
            }), dAsPoints.x, dAsPoints.y, {
                width: dAsPoints.width,
                height: dAsPoints.height
            });
        });
    }
    makeBarCode() {
        const params = this.getParams();
        if (!params.data.barcode) {
            return;
        }
        const layout = this.layout();
        const dAsPoints = layout.bottom.toPt();
        const barcodeCanvas = new canvas_1.Canvas(layout.bottom.toPx().width, layout.bottom.toPx().height, "image");
        console.log(layout.bottom);
        (0, jsbarcode_1.default)(barcodeCanvas, params.data.barcode, {
            font: "Helvetica",
            fontSize: 6,
            margin: 2,
            displayValue: false,
            height: layout.bottom.toPx().height / 2,
            width: 1
        });
        console.log({
            url: 'data:image/jpg;base64,' + barcodeCanvas.toBuffer().toString('base64'),
            height: barcodeCanvas.height,
            width: barcodeCanvas.width,
            px_w: layout.bottom.toPx().width,
            px_h: layout.bottom.toPx().height
        });
        params.document.image(barcodeCanvas.toBuffer(), dAsPoints.x, dAsPoints.y, {
            width: dAsPoints.width,
            height: dAsPoints.height
        });
    }
    makeDebugBox() {
        var _a;
        const params = this.getParams();
        if (((_a = process.env.DEBUG) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== 'true') {
            return;
        }
        params.document.rect(params.dimensions.toPt().x, params.dimensions.toPt().y, params.dimensions.toPt().width, params.dimensions.toPt().height).stroke('#555').fill('#fff');
    }
}
exports.Label = Label;
exports.default = Label;
