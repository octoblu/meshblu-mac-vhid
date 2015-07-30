'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-mac-vhid')
var machid = require("node_modules/mac-vhid/build/Release/machid");

var send = false;
var interval = 200;


var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    exampleBoolean: {
      type: 'boolean',
      required: true
    },
    keyPress: {
     type: 'object',
     properties: {
       enable: {
         type: 'boolean',
         required: false,
         default: false
       },
       function: {
         type: 'string',
         enum: ['keyUp', 'keyDown'],
         required: false
       },
       key: {
         type: 'string',
         required: false
       }
     }
   },
   mouse: {
    type: 'object',
    properties: {
      enable: {
        type: 'boolean',
        required: false,
        default: false
      },
      mode: {
        type: 'string',
        enum: ['move_delta', 'move_absolute'],
        required: false
      },
      x: {
        type: 'number',
        required: false,
      },
      y: {
        type: 'number',
        required: false,
      }
    }
  }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    sendmouse: {
      type: 'boolean',
      title: 'Broadcast current mouse position?',
      required: true,
      default: false
    },
    interval: {
      type: 'number',
      default: 200
    }
  }
};

function Plugin(){
  this.options = {};
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload;

  if(payload.mouse.enable == true){
  if(payload.mouse.mode == "move_delta"){
    machid.mouseMoveDelta(payload.mouse.x, payload.mouse.y);
    machid.mouseShow();
  }else if(payload.mouse.mode == "move_absolute"){
    machid.mouseMoveABS(payload.mouse.x,payload.mouse.y);
    machid.mouseShow();
  }
}

  if(payload.keyPress.enable == "true"){
    if(payload.keyPress.function == "keyUp"){
      machid.keyUp(payload.keyPress.key);
    }else if(payload.keyPress.function == "keyDown"){
        machid.keyUp(payload.keyPress.key);
      }
  }
};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
  send = device.options.sendmouse;
  if(device.options.interval < 200){
    interval = 200;
  }else{
    interval = device.options.interval;
  }
};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

setInterval(function() {


    if (send == true) {

      self.emit('message',{
        "devices": "*",
        "payload": machid.mouseGetCurrentPosition()
      });

    }


  }, interval);

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
