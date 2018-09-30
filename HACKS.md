# HACKS

This file documents some of the more egregious hacks that make this work.

There are of course countless hacks that aren't documented, these are just for things that might be particularly confusing.

### tracking.js patch

I manually patched our minified version of tracking.js to fix this bug: https://github.com/eduardolundgren/tracking.js/issues/267

since we need to have the video element be "display: none".