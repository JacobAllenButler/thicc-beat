import { Component, OnInit } from '@angular/core';
import * as WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.css']
})
export class WaveformComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  initWavesurfer(){
    var wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: 'violet',
      progressColor: 'purple'
    });

  wavesurfer.load('../assets/test.mp3');
    
  wavesurfer.on('ready', function () {
    wavesurfer.play();
});
  }

}
