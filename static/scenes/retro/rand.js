// https://gist.github.com/mathiasbynens/5670917

export default function build(seed = 0x2F6E2B1) {
  return () => {
    // Robert Jenkins' 32 bit integer hash function
    seed = ((seed + 0x7ED55D16) + (seed << 12))  & 0xFFFFFFFF;
    seed = ((seed ^ 0xC761C23C) ^ (seed >>> 19)) & 0xFFFFFFFF;
    seed = ((seed + 0x165667B1) + (seed << 5))   & 0xFFFFFFFF;
    seed = ((seed + 0xD3A2646C) ^ (seed << 9))   & 0xFFFFFFFF;
    seed = ((seed + 0xFD7046C5) + (seed << 3))   & 0xFFFFFFFF;
    seed = ((seed ^ 0xB55A4F09) ^ (seed >>> 16)) & 0xFFFFFFFF;
    return (seed & 0xFFFFFFF) / 0x10000000;
  };
}
