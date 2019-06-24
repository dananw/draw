import React, {Component, Fragment} from 'react';

//CANVAS
import { Stage, Layer, Text, Line } from 'react-konva';
import {
  getCenteredFromTwoPoint, 
  calcDistance,
  calcMeasure,
  calcPoligonArea,
  calcAngleDegrees,
  infoCoordinate,
} from './utils'

export default class Editor extends React.Component {
  state = {
    measure: 'distance',
    calibrate: false,
    calibrate_value: 0,
    coordinate: [],
    drawed_coordinate: [],
    calibrate_coordinate: [],
    
    // DATA TEXT
    centered_coordinate: [],
    drawed_centered_coordinate: [],

    x: 0,
    y: 0,
    distance_x: 0, 
    distance_y: 0,
    toggleModal: false,
  };

  // stageNode = React.createRef();
  tmp_coordinate = [];
  obj_coordinate = [];
  step = 0;

  componentWillReceiveProps(nextProps) {
    if(nextProps.measure !== this.props.measure) {
      this.setState({
        measure: nextProps.measure
      })
    }

    if(nextProps.calibrate !== this.props.calibrate) {
      this.setState({
        calibrate: nextProps.calibrate
      })
    }

    if(nextProps.calibrate_value !== this.props.calibrate_value) {
      this.setState({
        calibrate_value: nextProps.calibrate_value
      })
    }
  }

  showInfo(e) {
    console.log(infoCoordinate(e))
  }

  mouseDown = (e) => {
    const {calibrate_value} = this.state;
    let x = e.evt.offsetX;
    let y = e.evt.offsetY;

    if(this.state.measure) {
      let last_x, last_y, distance_x, distance_y;

      this.step += 1;
      this.obj_coordinate.push({x, y});
      this.tmp_coordinate = [...this.tmp_coordinate, x,y];
      if(2 >= this.tmp_coordinate.length) {
        // CHECK UNTUK PERTAMA KALI
        last_x = 0;
        last_y = 1
      }else{
        last_x = this.tmp_coordinate.length - 4;
        last_y = this.tmp_coordinate.length - 3
      }

      // kalkulasi jarak point x
      distance_x = calcDistance(x, this.tmp_coordinate[last_x]);

      // kalkulasi jarak point y
      distance_y = calcDistance(y, this.tmp_coordinate[last_y]);
      this.setState({
        coordinate: [...this.state.coordinate, x,y],
        distance_x: calcMeasure(distance_x, calibrate_value),
        distance_y: calcMeasure(distance_y, calibrate_value),
        x: x,
        y: y,
      });

      if(this.step > 1 ) {
        if(this.obj_coordinate[this.step -1].x === this.obj_coordinate[this.step - 2].x && this.obj_coordinate[this.step -1].y === this.obj_coordinate[this.step - 2].y) {
          // deteksi coordinate x, y yg terakhir sama, karna double click
          return
        }

        // let angle = calcAngleDegrees(this.obj_coordinate[this.step - 1], this.obj_coordinate[this.step - 2]);
        // console.log(angle)

        let center_point = getCenteredFromTwoPoint(this.obj_coordinate[this.step - 1], this.obj_coordinate[this.step - 2], calibrate_value)
        this.setState({
          centered_coordinate: [...this.state.centered_coordinate, center_point]
        })
      }
    }

    if(this.state.calibrate) {
      if(this.state.calibrate_coordinate.length >= 4) return; // to stop add point

      this.setState({
        calibrate_coordinate : [...this.state.calibrate_coordinate, x,y],
      });

      if(this.state.calibrate_coordinate.length >= 4) {
        let last_x = this.state.calibrate_coordinate.length - 2;
        let distance = calcDistance(this.state.calibrate_coordinate[0], this.state.calibrate_coordinate[last_x]);

        this.props.showModal(distance);
        this.setState({
          calibrate_coordinate: []
        })
      }
    }
  };

  doubleClick = (e) => {
    if(this.state.measure) {
      const {drawed_coordinate, coordinate, drawed_centered_coordinate, centered_coordinate, calibrate_value} =  this.state;

      // let totalArea = calcPoligonArea(centered_coordinate);

      this.obj_coordinate = [];
      this.step = 0;

      // Re setting coordinate
      this.tmp_coordinate = [];
      this.setState({
        drawed_coordinate: [...drawed_coordinate, coordinate],
        drawed_centered_coordinate: [...drawed_centered_coordinate, centered_coordinate],
        coordinate: [],
        centered_coordinate: [],
        distance_x: 0, 
        distance_y: 0,
      })
    }
  };

  render() {
    const {width, height} = this.props;
    const {
      measure, 
      calibrate, 
      coordinate, 
      drawed_coordinate,
      centered_coordinate,
      drawed_centered_coordinate,
      calibrate_coordinate,
    } = this.state;

    const DrawingLine = () => (
      <Line
        points={coordinate}
        closed={measure !== 'distance'}
        fill="#00fff29e"
        stroke={measure === 'distance' ? 'aqua' : 'black'}
        strokeWidth={1}
      />
    );

    const DrawedLine = () => (
      drawed_coordinate.map((item, key) => 
        <Line
          key={key}
          points={item}
          closed={measure !== 'distance'}
          fill="#00fff29e"
          stroke="black"
          strokeWidth={0.5}
        />
      )  
    );

    const MeasureLine = () => (
      <Line
        points={calibrate_coordinate}
        stroke="aqua"
        strokeWidth={1}
      />
    );

    const TextOverlay = () => (
      centered_coordinate.map((item, key) => 
        <Text
          key={key}
          fontSize={10}
          text={`${item.measure} m`}
          x={item.center_x}
          y={item.center_y}
        />
      )
    );

    const DrawedText = () => (
      drawed_centered_coordinate.map((data, data_key) => 
        data.map((item, key) => 
          <Text
            key={key}
            rotate={item.angle}
            rotation={item.angle}
            fontSize={10}
            text={`${item.measure} m`}
            x={item.center_x}
            y={item.center_y}
          />
        )
      )
    );

    return (
      <Fragment>
        <Stage
          // ref={this.stageNode}
          className="canvas-overlay"
          width={width} 
          height={height} 
          style={{'cursor': measure ? 'crosshair' : calibrate ? 'crosshair' : 'default'}}
          onClick={this.mouseDown}
          onDblClick={this.doubleClick}
          onMouseMove={this.mouseMove}
        >
          <Layer >
            {calibrate && <MeasureLine/>}
            {/*<TextInfo/>*/}
            {measure && <DrawingLine/>}
            <TextOverlay/>
            <DrawedText/>
            <DrawedLine/>
          </Layer>
        </Stage>
      </Fragment>
    );
  }
}
