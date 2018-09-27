### 9/26/18

Was working on getting it to distinguish red, green, and blue from each other. Challenges:

1. LED bulbs are VERY bright and overwhelm the camera for a few seconds after turning on.
2. The green and blue bulbs are very hard to distinguish from each other, their color profiles are extremely similar. Thoughts on fixing this:

- Maybe their red overrepresentation is different some how?
- Just collect data on each and plot it, see if you notice any systematic differences
- Keep a total history and observe the color when they first turn on, which seems to be a bit more representative
- Use history tracking techniques from Dan Shiffman's video and take an average (or maybe the extremes?) of the data from their entire histories, which might make it easier.