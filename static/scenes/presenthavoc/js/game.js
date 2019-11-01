goog.provide('app.Game')

goog.require('app.Controls')

app.Game = function(context) {
  console.log('hello')
  this.context = context
  this.controls = new app.Controls(this)
}