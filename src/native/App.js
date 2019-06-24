import React, {PureComponent} from 'react';
import '../App.css'

export default class App extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      activeEditor: false
    }

    this.canvas = undefined;
    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;

    this.ctx = undefined;
    this.rect = undefined;

    this.space = 40;
    this.primaryColor = "#1a90ff"
    this.coordinate = []
    this.ghostCoordinate = []
    this.ghostLine = false
    
  }

  onActivateEditor = () => {
    this.setState({
      activeEditor: true,
    })
  }

  init() {
    this.canvas = this.refs.canvas

    if(this.canvas.getContext) {
      this.ctx = this.canvas.getContext("2d")
      this.rect = this.canvas.getBoundingClientRect();

    }else{
      alert('Your browser unsupported')
    }
  }

  clear = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.coordinate = []
  }

  onCanvasMouseDown = (e) => {
    if(!this.state.activeEditor) return

    let x = e.clientX - this.rect.left
    let y = e.clientY - this.rect.top

    this.saveArrCoordinate(x, y)
    this.ghostCoordinate = [{x, y}]
    this.drawLine(x, y)
    this.ghostLine = false
  }

  onCanvasMouseUp = () => {
    this.ghostLine = true
  }

  onCanvasMouseMove = (e) => {
    if(!this.state.activeEditor) return
    if (!this.ghostLine) return

    let x = e.clientX - this.rect.left
    let y = e.clientY - this.rect.top

    let localPos = {
      x: this.ghostCoordinate[0]['x'],
      y: this.ghostCoordinate[0]['y'], 
    }
    console.log(localPos);
    

    this.ctx.beginPath()
    this.ctx.moveTo(localPos.x, localPos.y);

    let currPos = {
      x: x,
      y: y,  
    }

    this.ctx.lineTo(currPos.x, currPos.y);
    this.ctx.stroke()
    this.ctx.closePath();

    // this.ghostCoordinate = [{x, y}]

  }

  onCanvasDoubleClick = (e) => {
    const {coordinate} = this
    let last_index = coordinate.length - 1

    if(coordinate.length > 1) {
      if(coordinate[0]['x'] === coordinate[last_index]['x'] && coordinate[0]['y'] === coordinate[last_index]['y']) {
        alert('sama')
      }
    }

    this.coordinate = []
    this.ghostCoordinate = []
    this.setState({
      activeEditor: false
    })
  }

  saveArrCoordinate = (x, y) => {
    this.coordinate.push({x, y})
  }

  createCheckPoint(x, y) {
    this.ctx.rect(x, y, 50, 50);
  }

  drawLine(x, y) {
    const { ctx, coordinate } = this
    
    ctx.strokeStyle = this.primaryColor
    ctx.beginPath()

    coordinate.map((item, i, arr) => {
      if(arr.length > 1 && arr.length - 1 === i) {
        // STOP POINT PATH
        // console.log('stop', item.x, item.y);

        ctx.lineTo(item.x, item.y);

      }else if(arr.length === 1 || arr.length - 2 === i) {
        // START POINT PATH
        // console.log('start', item.x, item.y);

        ctx.moveTo(item.x, item.y);
        // this.createCheckPoint(item.x, item.y)
      }
    })

    ctx.stroke()
  }

  componentDidMount() {
    this.init()
  }

  render() {
    return (
      <div className="noselect">
        <button onClick={this.onActivateEditor} className="overlay">Create Line</button>
        <button onClick={this.clear} style={{'marginRight':'1rem'}}>Clear</button>
        <p className="ib">double click to stop drawing</p>
        <canvas 
          ref="canvas" 
          onMouseDown={this.onCanvasMouseDown}
          onMouseUp={this.onCanvasMouseUp}
          onDoubleClick={this.onCanvasDoubleClick}
          onMouseMove={this.onCanvasMouseMove}
          width={this.canvasWidth - this.space * 2 } 
          height={this.canvasHeight - this.space * 2 } 
          style={{'cursor' : this.state.activeEditor ? 'crosshair' : 'default'}}
        />
      </div>
    );
  }
}
