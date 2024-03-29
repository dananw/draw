function saveToStorage(key, value) {
  localStorage.setItem(key, value)
}

function getFromStorage(key) {
  return localStorage.getItem(key)
}
export function calcArea(coordinate) {
  // Formula (((x1 . y2) - (y1 . x2)) + ((x2 . y3) - (y2 . x3)) .... + ( (xn . y1) - (yn - x1) ) / 2)
  let measure = 0;

  for (let i = 1; i < coordinate.length; i++) {
    if(i === coordinate.length - 1) {
      measure += (coordinate[i].measure_x * coordinate[0].measure_y - coordinate[i].measure_y * coordinate[0].measure_x)
    }else{
      measure += (coordinate[i].measure_x * coordinate[i+1].measure_y - coordinate[i].measure_y * coordinate[i+1].measure_x)
    }
  }

  for (let i = 1; i < coordinate.length; i++) {
    if(i === coordinate.length - 1) {
      measure += (coordinate[i].measure_x * coordinate[0].measure_y - coordinate[i].measure_y * coordinate[0].measure_x)
    }else{
      measure += (coordinate[i].measure_x * coordinate[i+1].measure_y - coordinate[i].measure_y * coordinate[i+1].measure_x)
    }
  }
  return (Math.abs(measure)).toFixed(2);
}

export function calcPerimeter(coordinate) {
  let around = 0;

  for(let j = 0; j < coordinate.length; j++) {
    around += parseFloat(coordinate[j].measure)
  }
  return (Math.abs(around)).toFixed(2);
}

export function infoCoordinate(e) {
  const {layerX, layerY, offsetX, offsetY, pageX, pageY, screenX, screenY} = e.evt

  return  {
    layerX,
    layerY,
    offsetX,
    offsetY,
    pageX,
    pageY,
    screenX,
    screenY
  };
}

export function calcMeasure(distance, calibrate_value) {
  return (Math.abs(distance * calibrate_value)).toFixed(2)
}

export function calcDistance(point1, point2) {
  return Math.abs(point1 - point2)
}

function calcDistanceTwoPoint(coordinate1, coordinate2) {
  // ======== Simple Formula  ======== //
  // x = x2 - x1
  // y = y2 - y1
  // distance = Math.sqrt( (x * x) + (y * y) )

  // ======== Hypotenus equation Formula  ======== //
  // distance = a^2 + b^2 = c^2
  return (Math.hypot(coordinate2.x - coordinate1.x, coordinate2.y - coordinate1.y)).toFixed(2);
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

  let angle = Math.atan2(y, x) * 180 / Math.PI;

  return Math.floor(angle)
}

function rotationText(angle) {
  // Human readable
  let rotation = 0;

  if(angle > 90) {
    rotation = angle - 180
  } else if(angle < -90) {
    rotation = angle + 180
  }else {
    rotation = angle
  }
  return rotation;
}

export function getCenteredFromTwoPoint(coordinate1, coordinate2, calibrate_value) {
  let angle = calcAngleDegrees(coordinate1, coordinate2);

  let rotation_text = rotationText(angle);

  let distance = calcDistanceTwoPoint(coordinate1, coordinate2);
  let measure = calcMeasure(distance, calibrate_value);

  let distance_x = calcDistance(coordinate1.x, coordinate2.x);
  let distance_y = calcDistance(coordinate1.y, coordinate2.y);

  let measure_x = calcMeasure(distance_x, calibrate_value);
  let measure_y = calcMeasure(distance_y, calibrate_value);

  let center_x = (Math.round((coordinate1.x + coordinate2.x) / 2));
  let center_y = (Math.round((coordinate1.y + coordinate2.y) / 2));
  let x = coordinate1.x;
  let y = coordinate1.y;

  let center_position = {
    angle,
    rotation_text,
    x,
    y,
    center_x,
    center_y,
    measure_x,
    measure_y,
    measure,
    distance,
  };
  console.log(center_position);
  return (center_position)
}
