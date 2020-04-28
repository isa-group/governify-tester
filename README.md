![alt build:passed](https://travis-ci.org/isa-group/governify-tester.svg?branch=master)

[![NPM](https://nodei.co/npm/governify-tester.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/governify-tester/)

## 1. Install the package
```bash
npm install governify-tester --save
```


## 2. Install the governify-cli and use it in your shell
```bash
npm install governify-cli -g
```
[see doc ](https://github.com/isa-group/governify-cli)

## 3. Use from code
Import library in you code

```javascript
var tester = require("governify-tester");
```
* All results generate a logfile into the directory where is launched.
* Also you can obtain the results of each test. It is because all methods return a Promises
### 3.1 Simple requests with duration

* Params: URL, method , number of times, duration [body], [headers]

```javascript
tester.doParallelRequestWithDuration("https://www.google.es/", "GET", 2, 1);

```
If you need the result, you can use the method **then** because it's a
promise

```javascript
tester.doParallelRequestWithDuration("https://www.google.es/", "GET", 2, 1).then(function(success) {
    console.log(success);
});

```
* You can pass body for test. Only you need to pass body like a string.
* You could also pass headers in next params

```javascript

lib.doParallelRequestWithDuration("https://jsonplaceholder.typicode.com/posts", "POST", 2, 1, "{	\"isagroup\": 1}");

```

### 3.2 Simple requests once
You only test endpoint n times once.

* Params: URL, method , number of times, [body], [headers]

```javascript

tester.doOneStackOfRequest("http://google.es", "GET",2);

```
It is also possible to pass body and headers in the same order that the first one.

### 3.3 Simple requests infinite
This one is special because not return any result a need that you stop it.
* Params: URL, method , number of times, [body], [headers]

```javascript

tester.doRequests("http://google.es", "GET", 2);


```

### 3.4 Read test from file
This options is strict.
It only has certain types that will be described below.
You must write in yaml format and you only have to indicate the path of file.
* Params: Path

```javascript
tester.doParallelRequestFromfile('./test.yaml');

```

### Types of tests for config file
*  #### long


```bash
testId: idoftest
type: long
url : https://twitter.com/
duration: 3 #seconds
count: 2 #number of times
method: GET
```
*  #### interval
You have to define intervals a its duration necessarily.

```bash
testId: validation14
type: interval
url: http://localhost:3000/test
request:
  method: POST
  headers:
    content-type: application/json
    heade1: val
  body:
    id: MyID
    value: XXX
tenants:
  - id: t1
    intervals:
      - 8
      - 5
    duration: 1
  - id: t2
    intervals:
      - 6
      - 4
    duration: 1
  - id: t3
    intervals:
      - 1
      - 8
    duration: 1
  - id: t4
    intervals:
      - 3
      - 3
    duration: 1
```
 * #### random
 You need to write an array within the body
 ```bash
 testId: validation12
 type: random
 url : https://jsonplaceholder.typicode.com/posts
 duration: 4 #seconds
 count: 10
 request:
   method: POST
   headers:
     content-type: application/json
   body: #randomize in body
     id:
       - prueba
       - prueba1
       - prueba2
       - prueba3
       - prueba4
     value:
       - value
       - value1
       - value2
       - value3
       - value4
     date:
       - Date #currently date

 ```
* #### randomTemplate
```bash
testId: validation11
type: randomTemplate
url : https://jsonplaceholder.typicode.com/posts
duration: 4 #seconds
count: 10
request:
  method: POST
  randomFields:
    id:
      - prueba
      - prueba1
      - prueba2
      - prueba3
      - prueba4
    value:
      - value
      - value1
      - value2
      - value3
      - value4
    date:
      - Date #currently date
  headers:
    content-type: application/json
    #randomize in body
  body: >
          {
          "id": "{{id}}",
          "value": "{{value}}",
          "date": "{{date}}"
          }

```



# Governify Cli

Cli is a component of the governify ecosystem

## Copyright notice

**governify-cli** is an Open-source software available under the GNU General Public License (GPL) version 2 (GPL v2) 
for non-profit applications; for commercial licensing terms, please [contact](./extra/contact.md) for any inquiry.

All including documentation and code are copyrighted and the copyright is owned by [ISA Group](http://www.isa.us.es), 
[University of Sevilla](http://www.us.es), unauthorized reproduction or distribution of this copyrighted work is illegal.

For technical inquiry please contact to [engineering team](./extra/about.md).

## Latest release

The version 0.0.2 is the latest stable version of governify-tester component.
see [release note](https://github.com/isa-group/governify-tester/releases/tag/0.0.2) for details.

For running:

- Download latest version from [0.0.2](https://github.com/isa-group/governify-tester/releases/tag/0.0.2)
