# simple-jsonp-promise

## Installation

``` bash
yarn add simple-jsonp-promise
```

## Example

``` bash
import jsonp from 'simple-jsonp-promise'
let options = {
        params:{
            a : 1,
            b : 2
        },
        jsonp : 'callback',
        prefix : '__jp',
        timeout : 15000
    }
let response = await jsonp('https://localhost/api.jsonp' , options);
```