## 9/28

- More-or-less functional lightbulb tracking working
- Also tested with projector

To do next:
- send recordings to server and process into video
- UI for fullscreen, starting and stopping recording
- UI for emptying screen of gestures
- get more appealing cover for lightbulbs, tune detection parameters for it
- refactor code to make it a bit easier to tweak parameters of bulb detection
- decorate holders?
- test in more light conditions
- start making signs/decorations?
- performance optimization?

## 9/29

- fix bug where other colors don't animate while one color is being drawn
- try to find some sort of nice holder thing for the lightbulbs?


### UI

what does it need to do?

- initial state
  - you walk up to it and it has some enticing text plus a live video of what you're doing
  - it also has a message that explains how to start recording (e.g. press space to start)
- text entry state
  - text field for entering your name, and text field for entering a message to john and emily 
  - some text like "press space again to start!"
  - i think we should just use space for doing pretty much everything, space is a big button that no one's gonna miss
  - when you hit space, it does like a 3... 2... 1... and then a big flash, like the mac Photo Booth app, then goes to recording state
- recording state
  - start recording the video
  - show a little timer in the corner that countsdown how much time you have left
  - big "finished recording!" flash when the time runs out
  - save video with an id ALONG WITH a text file containing the name / message
  - go back to intial state
  
  
### textual instructions to print out and put on table

- "use arrow keys to switch between effects"
- "if anything seems broken, find Rachel Hwang or James Porter"
- what to do if lightbulb isn't drawing anything
  - hold away from self/clothes/other lightbulbs, against a dark background
  - move more slowly
  - wait a few seconds before moving after turning on
  
### other things to buy/make/borrow

- KEYBOARD FROM WORK ABSOLUTELY CRITICAL
- extra extension cords, ideally black, with one plug on the end
- small lamps with shades that produce diffuse, even colored light
- plain white socks
- black electrical tape
- ribbon?
- small labels for on/off switches on lightbulbs

### note for blog post

- joy of making something where the "production environment" is your laptop, so "works on my machine" is totally good enough, e.g. downloading the webfont locally
- pains of glitch:
  - downloading tarballs is version control strategy
  - webfont disaster, assets don't download locally
  - working on different parts of the code at the same time sucks
  
## 9/30
  
-  back to work on getting UI made and hooked up

- got distracted doing a bunch of lightbulb stuff, taking them apart

- decided that putting felt over the lightbulbs will work just fine in a pinch

## 10/1

- painted inside of the red and green lightbulb covers at work

- again working on UI

## 10/2 

- fairly chill work on polishing some UI stuff

- tried painting lightbulbs at work

revisiting todo list:

- ~~send recordings to server and process into video~~
- ~~UI for fullscreen, starting and stopping recording~~
- ~~UI for emptying screen of gestures~~
- ~~get more appealing cover for lightbulbs, tune detection parameters for it~~
- refactor code to make it a bit easier to tweak parameters of bulb detection
- decorate holders?
- ~~test in more light conditions~~
- start making signs/decorations?
- ~~performance optimization?~~