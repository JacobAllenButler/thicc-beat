import { Component, OnInit } from '@angular/core';
import * as p5 from 'p5';
import "p5/lib/addons/p5.sound";
import "p5/lib/addons/p5.dom";
/*
import * as Tone from 'tone';

Tone.Transport.start();

// 1D array with 16 columnss
var sequencerMatrix = new Array(4);

for(var i=0;i<4;i++){
  sequencerMatrix[i] = ['','','','','','','','','','','','','','','',''];
}

var sampler = new Tone.Sampler({
  "C4" : "cam-kick.wav",
  "D4" : "cam-bass.wav",
  "E4" : "cam-snare.wav",
  "F4" : "cam-clap.wav"
},{
  "baseUrl": "./../../assets/CamAudioSample/"
}).toMaster();

var seq = new Tone.Sequence(function(time, col)
{
  for(var i = 0;i<4;i++)
  {
    if(sequencerMatrix[i][col] != '')
    {
      sampler.triggerAttack(sequencerMatrix[i][col]);
    }
  }
},[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "16n");
**/

@Component({
  selector: 'app-sequencer',
  templateUrl: './sequencer.component.html',
  styleUrls: ['./sequencer.component.css']
})


export class SequencerComponent implements OnInit {

  ngOnInit()
  {
    const sketch = (s) => {

      s.preload = () => {
        let hh, clap, bass;
        let hPat, cPat, bPat;
        let hPhrase, cPhrase, bPhrase;
        let drums; //Basically the drumrack. attach phrases to drumrack's parts. ~sequencer transport
        let bpmCTRL; //bpm
        let beatLength; //number of beat steps
        let cnv;
        let sPat; //The series of sequencer steps
        let cursorPos; 
      }

      s.setup = () => {
        s.cnv = s.createCanvas(800, 150);
        s.cnv.position(100, 800);
        //canvasPressed is a user defined function
        s.cnv.mousePressed(s.canvasPressed);
        //assign instance of # of steps & the visual intervals of the sequencer cells
        s.beatLength = 16;
        s.cellWidth = s.width/s.beatLength;
        s.cursorPos = 0;
        //loading instruments w/ their respective audio files
        s.hh = s.loadSound('/assets/CamAudioSample/cam-kick.wav', () => {} );
        s.clap = s.loadSound('/assets/CamAudioSample/cam-bass.wav', () => {} );
        s.bass = s.loadSound('/assets/CamAudioSample/cam-clap.wav', () => {} );
        //hardcoding each instruments default patterns
        s.hPat = [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0];
        s.cPat = [0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1];
        s.bPat = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
        //array of the sequencer steps
        s.sPat = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        //each patterns respective phrase
        s.hPhrase = new p5.Phrase('hh', (time) => {s.hh.play(time); console.log(time); }, s.hPat);
        s.cPhrase = new p5.Phrase('clap', (time) => {s.clap.play(time); console.log(time); }, s.cPat);
        s.bPhrase = new p5.Phrase('bass', (time) => {s.bass.play(time); console.log(time); }, s.bPat);
        //initialize drums variable add each instruments' phrasing to collection of all instruments on drums
        s.drums = new p5.Part();
        s.drums.addPhrase(s.hPhrase);
        s.drums.addPhrase(s.cPhrase);
        s.drums.addPhrase(s.bPhrase);
        //Adding the sequencer steps to DRUMRACK Phrasing, calls on sequence function to draw Playhead in playback
        s.drums.addPhrase('seq', s.sequence, s.sPat);
        //hardcode the inital global bpm,create slider for bpm control,position&enlarge slider,assign slider value as bpm 
        s.drums.setBPM(90);
        s.bpmCTRL = s.createSlider(30, 200, 80, .5); //createSlider(min, max, initValue, incrementIntervals)
        s.bpmCTRL.position(100, 1000); s.bpmCTRL.style('width', '320px'); //positioning&enlarging slider
        s.bpmCTRL.input( () => {s.drums.setBPM(s.bpmCTRL.value())} );  
        //initialize the drawing of the sequencer matrix w/ drawMatrix()
        s.drawMatrix();
      }

      //logic for handling sequence playing
      s.keyPressed = () => {
        if (s.key === " ") {
          if (s.hh.isLoaded() && s.clap.isLoaded() && s.bass.isLoaded()) {
            if (!s.drums.isPlaying) {
              s.drums.loop();
            } else {
              s.drums.stop();
            }            
          } else {
            console.log('slowdown boi, audiofiles gotta load...');
          }
        }
      }

      //logic for handling user input on the sequencer 
      s.canvasPressed = () => {
        let rowClicked = s.floor(3*s.mouseY/s.height);
        let indexClicked = s.floor(16*s.mouseX/s.width);
        //logic for updating sequence arrays upon user input  
        if (rowClicked === 0) {
          console.log('first row ' + indexClicked);
          s.hPat[indexClicked] = +!s.hPat[indexClicked];
        }
        else if (rowClicked === 1) {
          console.log('second row ' + indexClicked);
          s.cPat[indexClicked] = +!s.cPat[indexClicked];
        }
        else if (rowClicked === 2) {
          console.log('third row ' + indexClicked);
          s.bPat[indexClicked] = +!s.bPat[indexClicked];
        }
        //call on the matrix to be drawn up use updated input using the above logic structure
        s.drawMatrix();
      }

      //logic to draw sequencer matrix, formerly in setup(), offers potential for variability in sequencer length
      s.drawMatrix = () => {
        //sets canvas background color; sequencer line color; line thickness; seq input dots are always white;
        s.background(144,0,255); s.stroke('gray'); s.strokeWeight(2); s.fill('white');
        //logic for drawing the sequencer grid
        for (let i = 0; i < s.beatLength; i++) { //line(startx,starty,endx,endy)
          s.line(i*s.cellWidth,0,i*s.cellWidth,s.height); //basically just draws the columns
        }
        //logic for drawing rows
        for (let i = 0; i < 4; i++) {
          s.line(0, i*s.height/3, s.width, i*s.height/3);
        }
        s.noStroke();
        //fill in sequencer with hardcored Pat array values by default
        for (let i=0; i < s.beatLength; i++) {
          if(s.hPat[i] === 1){
            s.ellipse(i*s.cellWidth +0.5*s.cellWidth, s.height/6, 30);
          }
          if (s.cPat[i] === 1) {
            s.ellipse(i*s.cellWidth +0.5*s.cellWidth, s.height/2, 30);
          }
          if (s.bPat[i] === 1) {
            s.ellipse(i*s.cellWidth +0.5*s.cellWidth, s.height*5/6, 30);
          }
        }
      }

      //refreshes/redraws matrix and playhead
      s.sequence = (time, beatIndex) => {
        s.drawMatrix();
        s.drawPlayhead(beatIndex);
      }

      //draws playhead indicating which step is currently being played
      s.drawPlayhead = (beatIndex) => {
        s.stroke('red');
        s.fill(255, 0, 0, 30); //fill(R, G, B, Alphas) <--could also just be # too
        s.rect((beatIndex-1)*s.cellWidth, 0, s.cellWidth, s.height);
      }

    }
    let canvas = new p5(sketch);

  }
  /*
  public notes: Array<string>;
  public columns: Array<string>;
  */

  constructor()
  {
    /*
    this.notes = ['C4','D4','E4','F4'];

    this.columns = ['00','01','02','03','04','05','06','07',
                    '08','09','10','11','12','13','14','15'];
    */
  }

  /*
  play(){
    if(seq.state=="stopped"){
      seq.start();
      console.log('play started');
    }
    else
    {
      seq.stop();
      console.log('play stopped');
    }
    return;
  }

  toggleCell(event)
  {

    var id = event.target.attributes.id.textContent;
    var cellValue = sequencerMatrix[event.target.dataset.y][event.target.dataset.x];

    if(cellValue == '')
    {
      document.getElementById(id).style.backgroundColor = "#faed27";
      sequencerMatrix[event.target.dataset.y][event.target.dataset.x] = event.target.dataset.note;
    }
    else
    {
      document.getElementById(id).style.backgroundColor = "black";
      sequencerMatrix[event.target.dataset.y][event.target.dataset.x] = ''
    }
  }
  */
}
