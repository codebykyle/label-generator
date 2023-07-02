import {Dimensions, Label as LabelContract, LabelGeneratorParams, LabelOptions} from "../types";
import QRCode from "qrcode";
import {Canvas} from "canvas";
import JsBarcode from "jsbarcode";
import {options} from "pdfkit";

export class Label extends LabelContract {
    getOptions(): LabelOptions {
        return {
            human_name: "Inventory Label",
            description: "An inventory label with a QR code, text area, and barcode"
        };
    }

    async generate() {
        this.makeDebugBox();
        await this.makeQRCode()
        this.makeLabel()
        this.makeBarCode()
    }


    protected layout(): { top: Dimensions, bottom: Dimensions, qr: Dimensions, text: Dimensions } {
        const params = this.getParams()

        const bottomSize = params.dimensions.height * 0.33;

        const top = new Dimensions({
            x: params.dimensions.x,
            y: params.dimensions.y,
            width: params.dimensions.width,
            height: params.dimensions.height - bottomSize
        })

        const bottom = new Dimensions({
            x: params.dimensions.x,
            y: params.dimensions.y + top.height,
            height: bottomSize,
            width: params.dimensions.width,
        })

        const qr = new Dimensions({
            x: params.dimensions.x,
            y: params.dimensions.y,
            height: top.width * 0.33,
            width: top.width * 0.33
        })

        const text = new Dimensions({
            x: params.dimensions.x + qr.width,
            y: params.dimensions.y,
            width: params.dimensions.width - qr.width,
            height: top.height
        })

        return {
            top,
            bottom,
            qr,
            text
        }
    }

    protected makeLabel() {
        const params = this.getParams()
        const layout = this.layout()
        const dAsPoints = layout.text.toPt()

        params.document
            .font('Helvetica')
            .fill('#000')
            .fontSize(6)
            .text(params.data.subtitle ?? "",
                dAsPoints.x,
                dAsPoints.y,
                {
                    width: dAsPoints.width,
                    ellipsis: true,
                    lineBreak: true
                }
            )
            .font('Helvetica-Bold')
            .fontSize(12)
            .text(params.data.title ?? "",
                {
                    width: dAsPoints.width,
                    ellipsis: true,
                    height: dAsPoints.height,
                    lineBreak: true
                });
    }

    protected async makeQRCode() {
        const params = this.getParams()

        if (!params.data.url) {
            return
        }

        const layout = this.layout()
        const dAsPoints = layout.qr.toPt()

        params.document.image(
            await QRCode.toBuffer(params.data.url, {
                errorCorrectionLevel: "M",
                margin: 2
            }),
            dAsPoints.x,
            dAsPoints.y,
            {
                width: dAsPoints.width,
                height: dAsPoints.height
            }
        );


    }

    protected makeBarCode() {
        const params = this.getParams()

        if (!params.data.barcode) {
            return
        }

        const layout = this.layout()
        const dAsPoints = layout.bottom.toPt()

        const barcodeCanvas = new Canvas(
            layout.bottom.toPx().width,
            layout.bottom.toPx().height,
            "image"
        );

        console.log(layout.bottom)

        JsBarcode(
            barcodeCanvas,
            params.data.barcode,
            {
                font: "Helvetica",
                fontSize: 6,
                margin: 2,
                displayValue: false,
                height: layout.bottom.toPx().height / 2,
                width: 1
            })

        console.log({
            url: 'data:image/jpg;base64,' + barcodeCanvas.toBuffer().toString('base64'),
            height: barcodeCanvas.height,
            width: barcodeCanvas.width,
            px_w: layout.bottom.toPx().width,
            px_h: layout.bottom.toPx().height
        });


        params.document.image(
            barcodeCanvas.toBuffer(),
            dAsPoints.x,
            dAsPoints.y,
            {
                width: dAsPoints.width,
                height: dAsPoints.height
            }
        );
    }

    protected makeDebugBox() {
        const params = this.getParams()

        if (process.env.DEBUG?.toLowerCase() !== 'true') {
            return
        }

        params.document.rect(
            params.dimensions.toPt().x,
            params.dimensions.toPt().y,
            params.dimensions.toPt().width,
            params.dimensions.toPt().height
        ).stroke('#555').fill('#fff')
    }

}


export default Label