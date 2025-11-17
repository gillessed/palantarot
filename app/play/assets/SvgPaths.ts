export interface SvgPath {
  pathString: string;
  viewBox: [number, number];
}

const Checkmark: SvgPath = {
  pathString:
    "M 4.82,69.68 c -14.89-16,8-39.87,24.52-24.76,5.83,5.32,12.22,11,18.11,16.27 L 92.81,5.46 c 15.79-16.33,40.72,7.65,25.13,24.07 l -57,68 A 17.49,17.49,0,0,1,48.26,103 a 16.94,16.94,0,0,1-11.58-4.39 c -9.74-9.1-21.74-20.32-31.86-28.9 Z ",
  viewBox: [122.88, 102.97],
};

export const SvgPaths = {
  Checkmark,
};
