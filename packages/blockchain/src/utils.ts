import {dirname} from "node:path";
import {fileURLToPath} from "url";

export const getDir = (url: string) => dirname(fileURLToPath(url));