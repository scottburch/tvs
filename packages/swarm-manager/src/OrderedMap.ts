export type OrderedMap = {
  entries: {key: string, value: any}[]
}

export const newOrderedMap = () => ({entries: []} as OrderedMap);

export const size = (map: OrderedMap) => map.entries.length;

export const add = (map: OrderedMap, key: string, value: any) => ({
  entries: [...map.entries, {key, value}]
} satisfies OrderedMap as OrderedMap);

export const update = (map: OrderedMap, key: string, value: any) => {
  const idx = findIdxByKey(map, key);
  if(idx === -1) {throw {code: 'KEY_NOT_FOUND', key}}
  map = {...map};
  map.entries[idx] = {key, value};
  return map;
};

export const get = (map: OrderedMap, key: string) =>
   map.entries.find(it => it.key === key)?.value


const findIdxByKey = (map: OrderedMap, key: string) =>
    map.entries.findIndex(it => it.key === key);


