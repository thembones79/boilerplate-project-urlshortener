## ✂️ API Project: URL Shortener Microservice for freeCodeCamp


### User Stories

1. I can POST a URL to `https://awake-stag.glitch.me/api/shorturl/new` and I will receive a shortened URL in the JSON response. Example : `{"original_url":"https://forum.freecodecamp.com","short_url":98}`
2. If I pass an invalid URL that doesn't follow the valid `http(s)://www.example.com(/more/routes)` format, the JSON response will contain an error like `{"error":"invalid URL"}`. 

*HINT*: to be sure that the submitted url points to a valid site you can use the function `dns.lookup(host, cb)` from the `dns` core module.
3. When I visit the shortened URL, it will redirect me to my original link.


#### Creation Example:

POST `https://awake-stag.glitch.me/api/shorturl/new` - body (urlencoded) :  `url=http://forum.freecodecamp.com`

#### Usage:

[https://awake-stag.glitch.me/api/shorturl/98](https://awake-stag.glitch.me/api/shorturl/98)

#### Will redirect to:

https://forum.freecodecamp.com


 *created with 🍕 & ❤️ Michał Szumnarski*