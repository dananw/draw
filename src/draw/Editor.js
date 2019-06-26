import React, {Component, Fragment} from 'react';

//CANVAS
import { Stage, Layer, Text, Line } from 'react-konva';
import {
  getCenteredFromTwoPoint, 
  calcDistance,
  // calcMeasure,
  calcArea,
  calcPerimeter,
  infoCoordinate,
} from './utils'

export default class Editor extends Component {
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

    toggleModal: false,
  };
  stageNode = React.createRef();
  layer = React.createRef();
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

  // mousePointerX = (e) => {
  //   console.log('Pointer X = ', e.evt.clientX)
  // };
  //
  // mousePointerY = (e) => {
  //   console.log('Pointer Y = ', e.evt.clientY)
  // };
  //
  // mouseMove = (e) => {
  //   this.mousePointerX(e);
  //   this.mousePointerY(e);
  // };

  mouseDown = (e) => {
    const {calibrate_value} = this.state;
    let x = e.evt.offsetX;
    let y = e.evt.offsetY;

    if(this.state.measure) {
      this.step += 1;
      this.obj_coordinate.push({x, y});

      this.setState({
        coordinate: [...this.state.coordinate, x,y],
      });

      if(this.step > 1 ) {
        if(this.obj_coordinate[this.step -1].x === this.obj_coordinate[this.step - 2].x && this.obj_coordinate[this.step -1].y === this.obj_coordinate[this.step - 2].y) {
          // deteksi coordinate x, y yg terakhir sama, karna double click
          return
        }

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
      const {drawed_coordinate, coordinate, drawed_centered_coordinate, centered_coordinate} =  this.state;

      let totalArea = calcArea(centered_coordinate);
      let totalParimeter = calcPerimeter(centered_coordinate);
      console.log(totalArea, totalParimeter);

      this.obj_coordinate = [];
      this.step = 0;

      // Re setting coordinate
      this.setState({
        drawed_coordinate: [...drawed_coordinate, coordinate],
        drawed_centered_coordinate: [...drawed_centered_coordinate, centered_coordinate],
        coordinate: [],
        centered_coordinate: [],
      });
    }
  };

  DrawedLineOver = (e) => {
    console.log('LINE over', e);
    e.currentTarget.attrs.stroke = "red";
    this.layer.current.draw()
  };

  DrawedLineOut = (e) => {
    e.currentTarget.attrs.stroke = "black";
    this.layer.current.draw()
  };

  drawedTextOver = (e) => {
    console.log(e)
  }

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
          strokeWidth={1}
          onMouseOver={this.DrawedLineOver}
          onMouseOut={this.DrawedLineOut}
          zIndex={1}
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
          rotation={item.rotation_text}
          fontSize={10}
          lineHeight={1}
          text={`${item.measure} m`}
          x={item.center_x}
          y={item.center_y}
        />
      )
    );

    const DrawedText = () => (
      drawed_centered_coordinate.map((data) =>
        data.map((item, key) => 
          <Text
            key={key}
            rotation={item.rotation_text}
            fontSize={10}
            zIndex={4}
            lineHeight={1}
            text={`${item.measure} m`}
            x={item.center_x}
            y={item.center_y}
            onMouseOver={this.drawedTextOver}
          />
        )
      )
    );

    return (
      <Fragment>
        <Stage
          ref={this.stageNode}
          className="canvas-overlay"
          width={width}
          height={height}
          style={{'cursor': measure ? 'crosshair' : calibrate ? 'crosshair' : 'default'}}
          onClick={this.mouseDown}
          onDblClick={this.doubleClick}
          // onMouseMove={this.mouseMove}
        >
          <Layer ref={this.layer}>
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
