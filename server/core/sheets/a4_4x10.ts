import {
    Dimensions,
    Units,
    LabelData,
    LabelRequest,
    SheetOptions,
    Sheet as SheetContract
} from "../types";

export class Sheet extends SheetContract {
    getOptions(): SheetOptions {
        return {
            human_name: "A4 4x10",
            description: "A4 sticker paper with a 4 by 10 arrangement of labels",
            paper_size: "A4",
            sticker_count: new Dimensions({
                x: 4,
                y: 10
            }),
            paper_margins: new Dimensions({
                width: 6,
                height: 17
            }),
            label_dimensions: new Dimensions({
                width: 48,
                height: 25
            }),
            label_margins: new Dimensions({
                width: 2,
                height:2
            }),
            margin_between: new Dimensions({
                width: 1.95,
                height: 1.98
            }),
        }
    }
}

export default Sheet