import capitalize from "lodash-es/capitalize.js";

export const raceDisplayName = (n: string) =>
    n.split('-').map(capitalize).join(' ');