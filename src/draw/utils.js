function saveToStorage(key, value) {
  localStorage.setItem(key, value)
}

function getFromStorage(key) {
  return localStorage.getItem(key)
}

// function calculateMeasure(coordinate1, coordinate2) {
//   const {distance_x, distance_y} = this.state
//   let distance = 0

//   if(distance_x > distance_y) {
//     distance = distance_x

//   }else if(distance_x < distance_y){
//     distance = distance_y
//   }

//   return distance.toFixed(2)
// }

export function  calcPoligonArea(coordinate) {
  // Formula (((x1 . y2) - (y1 . x2)) + ((x2 . y3) - (y2 . x3)) .... + ( (xn . y1) - (yn - x1) ) / 2)

   let measure = 0;
   let around = 0;

  // Hitung Luas
  for (let i = 1; i < coordinate.length; i++) {
    if(i === coordinate.length - 1) {
      measure += (coordinate[i].measure_x * coordinate[0].measure_y - coordinate[i].measure_y * coordinate[0].measure_x)
    }else{
      measure += (coordinate[i].measure_x * coordinate[i+1].measure_y - coordinate[i].measure_y * coordinate[i+1].measure_x)
    }
  }

  // Hitung Keliling
  for(let j = 0; j < coordinate.length; j++) {
    around += parseFloat(coordinate[j].measure)
  }

  let total_area = (Math.abs(measure)).toFixed(2);
  let total_around = (Math.abs(around)).toFixed(2);
  console.log("Luas = ", total_area, 'keliling = ' , total_around)
}

export function infoCoordinate(e) {
  const {layerX, layerY, offsetX, offsetY, pageX, pageY, screenX, screenY} = e.evt

  let info = {
    layerX,
    layerY,
    offsetX,
    offsetY,
    pageX,
    pageY,
    screenX,
    screenY
  }
  return info;
}

export function checkEven(n) {
  console.log(n);
  return n % 2 == 0
}

export function calcMeasure(distance, calibrate_value) {
  return (Math.abs(distance * calibrate_value)).toFixed(2)
}

export function calcDistance(point1, point2) {
  return Math.abs(point1 - point2)
}

export function saveCalibrate(data) {
  saveToStorage('calibrateData', JSON.stringify(data))
}

export function getCalibrate() {
  return JSON.parse(getFromStorage('calibrateData'))
}

export function calcAngleDegrees(coordinate1, coordinate2) {
  let x = coordinate2.x - coordinate1.x;
  let y = coordinate2.y - coordinate1.y;

  let value = Math.atan2(y, x) * 180 / Math.PI;
  value = (value > 90) ? value - 180 : value;

  return Math.floor(value)
}

export function getCenteredFromTwoPoint(coordinate1, coordinate2, calibrate_value) {
  let center_x = (Math.round((coordinate1.x + coordinate2.x) / 2));
  let center_y = (Math.round((coordinate1.y + coordinate2.y) / 2));

  let distance_x = calcDistance(coordinate1.x, coordinate2.x);
  let distance_y = calcDistance(coordinate1.y, coordinate2.y);

  let measure_x = calcMeasure(distance_x, calibrate_value);
  let measure_y = calcMeasure(distance_y, calibrate_value);

  let x = coordinate1.x;
  let y = coordinate1.y;

  let measure = measure_x > measure_y ? measure_x : measure_y;
  let angle = calcAngleDegrees(coordinate1, coordinate2);

  let center_position = {
    angle,
    x,
    y,
    center_x,
    center_y,
    measure_x,
    measure_y,
    measure,
  };
  console.log(center_position)
  return (center_position)
}
