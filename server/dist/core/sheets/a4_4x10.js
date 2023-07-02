"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sheet = void 0;
const types_1 = require("../types");
class Sheet extends types_1.Sheet {
    getOptions() {
        return {
            human_name: "A4 4x10",
            description: "A4 sticker paper with a 4 by 10 arrangement of labels",
            paper_size: "A4",
            sticker_count: new types_1.Dimensions({
                x: 4,
                y: 10
            }),
            paper_margins: new types_1.Dimensions({
                width: 6,
                height: 17
            }),
            label_dimensions: new types_1.Dimensions({
                width: 48,
                height: 25
            }),
            label_margins: new types_1.Dimensions({
                width: 2,
                height: 2
            }),
            margin_between: new types_1.Dimensions({
                width: 1.95,
                height: 1.98
            }),
        };
    }
}
exports.Sheet = Sheet;
exports.default = Sheet;
