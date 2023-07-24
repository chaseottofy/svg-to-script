interface ParserOptions {
    [key: string]: boolean;
}
interface ElementCounts {
    [key: string]: number;
}
interface ParseOptions {
    ids?: boolean;
    classes?: boolean;
    'data-attributes'?: boolean;
}

export { ElementCounts, ParseOptions, ParserOptions };
