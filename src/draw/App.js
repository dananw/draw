import React, {Component} from 'react';
import classNames from 'classnames'
//PDF
import { pdfjs } from 'react-pdf';
import { Document, Page } from 'react-pdf';
import Editor from './Editor.js'
import {saveCalibrate, getCalibrate} from './utils'

import './App.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const LENGTH_UNIT = 'm';

export default class App extends Component {
  state = {
    numPages: null,
    pageNumber: 1,
    file_pdf: '/pdf/source1.pdf',
    measure: null,
    calibrate: false,
    calibrate_value: 0,
    calibrate_coordinate: [],
    measurement: 0,
    distance: 0,

    // modal
    modalInput: 0,
    toggleModal: false,
    toggleTable: false,

    // zoom
    scale: 1,
  };

  distance_calibrate = 0;

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  goToPrevPage = () => {
    this.setState(state => ({ pageNumber: state.pageNumber - 1 }));
  };

  goToNextPage = () => {
    this.setState(state => ({ pageNumber: state.pageNumber + 1 }));
  };

  changeSource = (type) => {
    this.setState({
      file_pdf: `/pdf/source${type}.pdf`
    })
  };

  changeMeasure = (type) => {
    this.setState({
      measure: type,
      calibrate: false,
    })
  };

  calibrate = () => {
    this.setState({
      calibrate: true,
      measure: null
    })
  };

  handleKeyDown = (event) => {
    if(event.key === 'Shift') {
      console.log('shift hold')
    }
  };

  handleKeyUp = (event) => {
    if(event.key === 'Shift') {
      console.log('shift up')
    }
  };

  zoom = (type) => {
    let {scale} = this.state;

    if(type === 'in') {
      scale += 0.5
    }else{
      scale -= 0.5
    }

    this.setState({
      scale: scale
    })
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    let data_storage = getCalibrate();

    if(data_storage && data_storage !== "") {
      this.setState({
        calibrate_value: data_storage.calibrate_value,
        measurement: data_storage.measurement,
        distance: data_storage.distance,
      })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  onToggleTable = () => {
    this.setState({
      toggleTable: !this.state.toggleTable
    })
  }

  showModal = (distance) => {
    this.setState({
      toggleModal: !this.state.toggleModal,
    });
    this.distance_calibrate = distance
  };

  calibrateProcess = () => {
    let newData = {
      calibrate_value: (this.state.modalInput / this.distance_calibrate).toFixed(2),
      measurement: this.state.modalInput,
      distance: this.distance_calibrate,
      calibrate: false,
    };

    this.setState(newData);
    saveCalibrate(newData)
  };

  saveModal = () => {
    this.calibrateProcess();
    this.setState({
      modalInput: 0,
      toggleModal: false,
    });
  };

  renderModalMeasure() {
    return(
      <div className="modal" style={{'visibility': this.state.toggleModal ? 'visible' : 'hidden'}}>
        <label>Enter measurement between two points (in m), use (.) to separate decimal</label>
        <div className="box">
          <input type="text" value={this.state.modalInput} onChange={(e)=>this.setState({ modalInput: e.target.value })}/>
          <input type="button" value="save" onClick={this.saveModal}/>
        </div>
      </div>
    )
  }

  render() {
    const { pageNumber, numPages, measure, calibrate } = this.state;
    const { innerWidth, innerHeight } = window;
    const space = 300;

    let dzoom = {
      transform: 'scale('+ this.state.scale +')',
      transformOrigin: '0px 0px',
    };

    return (
      <div className="__dna">
        <div className="layout">
          <aside>
            <div className="menu-sidebar">
              <div className="ms-nav">
                {numPages > 1 &&
                <nav>
                  <button onClick={this.goToPrevPage} disabled={pageNumber <= 1}>Prev</button>
                  <button onClick={this.goToNextPage} disabled={pageNumber >= numPages}>Next</button>
                </nav>
                }
                <p>{`Page ${pageNumber} of ${numPages}`}</p>
              </div>
              <div className="source">
                <small>Source PDF:</small>
                <button onClick={()=>this.changeSource(1)}>source 1</button>
                <button onClick={()=>this.changeSource(2)}>source 2</button>
              </div>
              <div className="source">
                <small>Calibrate:</small>
                <button onClick={this.calibrate} className={calibrate ? 'btn-active' : null}>Calibrate X</button>
              </div>
              <div className="source calibrate-detail">
                <small>details: </small>
                <label>{`Measure : ${this.state.measurement} ${LENGTH_UNIT}`}</label>
                <label>{`Distance : ${this.state.distance} px`}</label>
                <label>{`Ratio in 1 pixel : ${this.state.calibrate_value} ${LENGTH_UNIT}`}</label>
              </div>
              <div className="source">
                <small>Measure by:</small>
                <button onClick={()=>this.changeMeasure('area')} className={measure === 'area' ? 'btn-active' : null}>Area</button>
                <button onClick={()=>this.changeMeasure('distance')} className={measure === 'distance' ? 'btn-active' : null}>Distance</button>
              </div>
              <div className="source">
                <small>Action:</small>
                <button onClick={()=>this.changeMeasure('area')} >Save</button>
                <button onClick={()=>this.changeMeasure('distance')} >Load</button>
                <button onClick={()=>window.location.reload()} >Clear</button>
              </div>
            </div>
          </aside>

          <section className="box-main">
            {this.renderModalMeasure()}
            <div className="d-editor" style={{height: this.state.toggleTable ? innerHeight - 180 : innerHeight}}>
              <div className="toolbar">
                <button className="toolbar-item toolbar-border" onClick={this.onToggleTable}>
                  <span className="ibox">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path d="M17 4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3l-2-2.5L6 10V6a2 2 0 0 1 2-2h9m0-2H8a4 4 0 0 0-4 4v3.3l-1.56 1.95-1 1.25 1 1.25L4 15.7V18a4 4 0 0 0 4 4h9a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4z"></path><path d="M8 10h9v1H8zm0 2h9v1H8zm0 2h9v1H8z" opacity=".5"></path><path d="M7.8 7a3.69 3.69 0 0 1 2.33-1.64 2.78 2.78 0 0 1 1.61.15 4 4 0 0 1 1.29.9 2.48 2.48 0 0 0 1.66.9 4.1 4.1 0 0 0 2.1-.58.3.3 0 0 1 .4.13.31.31 0 0 1 0 .31 3.55 3.55 0 0 1-2.47 1.47 3.4 3.4 0 0 1-2.81-1.18 2.18 2.18 0 0 0-1.65-.81 4.5 4.5 0 0 0-2.08.73.27.27 0 0 1-.37-.1A.26.26 0 0 1 7.8 7z"></path><circle cx="9" cy="17.5" r="1" opacity=".5"></circle><circle cx="12.5" cy="17.5" r="1" opacity=".25"></circle><circle cx="16" cy="17.5" r="1" opacity=".66"></circle></svg>
                  </span>
                </button>
                <button onClick={(e) => this.zoom('out')} className={classNames('toolbar-item toolbar-border', {'inactive-item': this.state.scale <= 1})} disabled={this.state.scale <= 1}>
                  <span className="ibox">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false">
                      <path d="M4.5 8h9v2h-9z" opacity=".5"></path>
                      <path d="M9 18a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zM9 2a7 7 0 1 0 7 7 7.008 7.008 0 0 0-7-7z"></path>
                      <path d="M20.556 23.03l-5.793-5.793 2.475-2.475 5.793 5.793a1 1 0 0 1 0 1.414l-1.06 1.06a1 1 0 0 1-1.415.001z" opacity=".66"></path>
                    </svg>
                  </span>
                </button>
                <button onClick={(e) => this.zoom('in')} className="toolbar-item toolbar-border">
                  <span className="ibox">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false"><path opacity=".5" d="M13.5 8H10V4.5H8V8H4.5v2H8v3.5h2V10h3.5V8z"></path><path d="M9 18a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zM9 2a7 7 0 1 0 7 7 7.008 7.008 0 0 0-7-7z"></path><path d="M20.556 23.03l-5.793-5.793 2.475-2.475 5.793 5.793a1 1 0 0 1 0 1.414l-1.06 1.06a1 1 0 0 1-1.415.001z" opacity=".66"></path></svg>
                  </span>
                </button>
              </div>
              <div className="sub-toolbar">
              </div>
              <div className="document" style={{ width: innerWidth - space}}>
                <div className={classNames({'document-zoom': this.state.scale > 1})} style={dzoom}>
                  <section>
                    <Editor
                      width={innerWidth - space*2}
                      height={735}
                      measure={this.state.measure}
                      calibrate={this.state.calibrate}
                      calibrateProcess={this.calibrateProcess}
                      calibrate_value={this.state.calibrate_value}
                      showModal={this.showModal}
                    />
                    <div className="main-pdf-view" style={{ width: innerWidth - space * 2}}>
                      <Document file={this.state.file_pdf} onLoadSuccess={this.onDocumentLoadSuccess}>
                        <Page pageNumber={pageNumber} width={innerWidth - space*2}/>
                      </Document>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </section>

          {/*Table*/}
          <section className="section-table" style={{'height': this.state.toggleTable ? '180px' : '0'}}>
            <div style={{'padding': '0.5rem'}}>
              <table>
                <thead>
                  <tr>
                    <th>Object</th>
                    <th>Area</th>
                    <th>Perimeter</th>
                    <th>Color</th>
                    <th>Layer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td align="center">690 m</td>
                    <td align="center">Perimeter</td>
                    <td align="center">
                      <div className="color-detector" style={{'backgroundColor': 'aqua'}}></div>
                    </td>
                    <td align="center">
                      <button>show</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    );
  }
}
