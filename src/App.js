import React, { Component } from 'react';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import Checkbox from 'material-ui/Checkbox'
import ReactDOM from 'react-dom';
import C3Chart from 'react-c3js';
import './c3.css';

class App extends Component {
  state = {
    checked: false,
    csvReady: false,
    currentFileName: '',
  }
  render() {
    return (
    <MuiThemeProvider>
      <div className="App">
        <AppBar
          title="IDEAHub"
          iconClassNameRight="muidocs-icon-navigation-expand-more"
        />
        <form onSubmit={this.handleSubmit.bind(this)}>
          <TextField hintText="Username" floatingLabelText="Username"
                type="text" id="user"
                onChange={this.handleChange.bind(this)}/><br/>
          <TextField hintText="Tweets amount" floatingLabelText="Tweets amount"
                type="text" id="tweet_amount"
                onChange={this.handleChange.bind(this)}/><br/>
          <TextField hintText="CSV file name" floatingLabelText="CSV file name"
                type="text" id="filename"
                onChange={this.handleChange.bind(this)}/><br/>
          <TextField hintText="Keyword" floatingLabelText="Keyword"
                type="text" id="keyword"
                onChange={this.handleChange.bind(this)}/><br/>
          <TextField hintText="Location" floatingLabelText="Location"
                type="text" id="near"
                onChange={this.handleChange.bind(this)}/><br/>
          <TextField  hintText="Radius" floatingLabelText="Radius"
                type="text" id="within"
                onChange={this.handleChange.bind(this)}/><br/>
          <DatePicker hintText="Start Date" floatingLabelText="Start Date"
                id="start_date" openToYearSelection={true}
                onChange={this.handleStartDateChange.bind(this)}/>
          <DatePicker hintText="End Date" floatingLabelText="End Date"
                id="end_date" openToYearSelection={true}
                onChange={this.handleEndDateChange.bind(this)}/><br/>
          <Checkbox label="Top Tweets" checked={this.state.checked}
                onCheck={this.handleCheck.bind(this)}
                />
          <RaisedButton label="Submit" type="submit"/><br/><br/><br/>
        </form>
        <div className="Option">
          {this.state.csvReady&& <RaisedButton label="Download"
                   href="./test.pdf" download={this.state.currentFileName}/>}
          {this.state.csvReady&& <RaisedButton label="See Analysis"
                   onClick={this.handleAnalysis.bind(this)}/>}
        </div>
        <br/><br/><br/>
      </div>
    </MuiThemeProvider>
    );
  }

  handleChange(e,index,value){
    this.setState({[e.target.id]: index});
  }
  handleStartDateChange(e,date){
    var format_date=date.getFullYear()+"-"+(date.getMonth()+1)+ "-" + date.getDate();
    this.setState({'start_date': format_date});
  }
  handleCheck(){
    this.setState((oldState) => {
      return {
        checked: !oldState.checked,
      };
    });
  }
  handleEndDateChange(e,date){
    var format_date=date.getFullYear()+"-"+(date.getMonth()+1)+ "-" + date.getDate();
    this.setState({'end_date': format_date});
  }
  handleSubmit(e){
    e.preventDefault();
    this.setState({'csvReady':false});
    var file = this.state.filename? this.state.filename+'.csv' : 'output_got.csv';
    this.setState({'currentFileName':file});
    // console.log(this.state.currentFileName);
    console.log(this.state);
    fetch('http://127.0.0.1:5000/api/form', {
      method: 'POST',
      headers: new Headers(
         {"Content-Type": "application/json"}
      ),
      body: JSON.stringify(this.state),
    }).then((result) =>{
    console.log('csv ready');
    // csvReady=true;
    this.setState({'csvReady':true});
    });
  }
  // handleDownload(e,index,value){
  //   e.preventDefault();
  //   console.log(this.state.currentFileName);
  //   window.open(this.state.currentFileName)
  // }
  handleAnalysis(e,index,value){
    e.preventDefault();
    fetch('http://127.0.0.1:5000/api/sentiment', {
      method: 'POST',
      headers: new Headers(
         {"Content-Type": "application/json"}
      ),
      body: JSON.stringify(this.state),
    }).then(res => res.json())
    .then(res =>{
      console.log('analysis sent');
      console.log(res);

      /*--------------------- OVERALL DOCUMENT SENTIMENT ------------------*/
      const overall_sent = {
        columns: [
          [res['sentiment']['document']['label'], Math.abs(res['sentiment']['document']['score'])*100]
        ],
        type: 'gauge'
      },
      gauge = {
        title: "Overall Sentiment"
      };
      ReactDOM.render(<C3Chart data={overall_sent} gauge={gauge} />, document.getElementById("document_sent"));

      /*------------------- DOCUMENT EMOTIONS BREAKDOWN (DONUT) ----------------------*/
      const doc_emotions_donut = {
        columns: [
          ['sadness', res['emotion']['document']['emotion']['sadness']],
          ['disgust', res['emotion']['document']['emotion']['disgust']],
          ['joy', res['emotion']['document']['emotion']['joy']],
          ['anger', res['emotion']['document']['emotion']['anger']],
          ['fear', res['emotion']['document']['emotion']['fear']]
        ],
        type: 'donut'
      },
      donut = {
        title: "Emotions Breakdown"
      };
      ReactDOM.render(<C3Chart data={doc_emotions_donut} donut={donut} />, document.getElementById('document_emotions_donut'));

      /*------------------- DOCUMENT EMOTIONS BREAKDOWN (BAR) -----------------------*/
      const doc_emotions_bar = {
        columns: [
          //['x', res['emotion']['document']['emotion']['sadness'], res['emotion']['document']['emotion']['disgust'], res['emotion']['document']['emotion']['joy'], res['emotion']['document']['emotion']['anger'], res['emotion']['document']['emotion']['fear']]
          ['sadness', res['emotion']['document']['emotion']['sadness']],
          ['disgust', res['emotion']['document']['emotion']['disgust']],
          ['joy', res['emotion']['document']['emotion']['joy']],
          ['anger', res['emotion']['document']['emotion']['anger']],
          ['fear', res['emotion']['document']['emotion']['fear']]
        ],
        type: 'bar',
        /*
        colors: {
          anger: '#ff0000',
          disgust: '#556b2f',
          fear: '#800080',
          joy: '#ffff00',
          sadness: '#1f77b4'
        }
        */
      },
      axis = {
        /*
        x: {
          type: 'category',
          categories: ['sadness', 'disgust', 'joy', 'anger', 'fear']
        },
        */
        rotated: true
      },
      bar = {
        width: 50,
        title: 'Emotions'
      };

      ReactDOM.render(<C3Chart data={doc_emotions_bar} bar={bar} axis={axis} />, document.getElementById('document_emotions_bar'));
    });
  }
}

export default App;
