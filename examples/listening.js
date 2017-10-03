#!/usr/bin/env node
const ubsub = require('../')('ry2VZ8e3Z', 'a12e59acf83bbda211e02f9f7bbe6069eeac623412953da8b8179ef4db4ee061');

/* eslint no-console: off */
ubsub.listen('SylW8bIe3Z', (event) => {
  console.log(`received event ${JSON.stringify(event)}`);
});

ubsub.forward('SylW8bIe3Z', 'http://localhost:8000');
