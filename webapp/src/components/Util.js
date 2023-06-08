
export const categoricalColorMap = {
  0: '#1f77b4',
  1: '#ff7f0e',
  2: '#2ca02c',
  3: '#d62728',
  4: '#9467bd',
  5: '#8c564b',
  6: '#e377c2',
  7: '#5f5f5f',
  8: '#bcbd22',
  9: '#17becf',
  10: '#9fb7f4',
  11: '#e88e6f'
};

export const colorsTurboArray = [
  0.0, '#30123b',
  0.071, '#4145ab',
  0.143, '#4675ed',
  0.214, '#39a2fc',
  0.286, '#1bcfd4',
  0.357, '#24eca6',
  0.429, '#61fc6c',
  0.5, '#a4fc3b',
  0.571, '#d1e834',
  0.643, '#f3c63a',
  0.714, '#fe9b2d',
  0.786, '#f36315',
  0.857, '#d93806',
  0.929, '#b11901',
  1.0, '#7a0402'
];


export const circularArray = (i, n, r) => {
  // i : ith element
  // n : number of total elements
  // radius 
  const x = Math.cos(i * Math.PI / n);
  const y = Math.sin(i * Math.PI / n);
  return [x, y]
}

export const obj2flatArray = (obj) => {
  const res = Object.keys(obj).map(
    (key) => [Number(key), obj[key]]).flat();
  return res
};


