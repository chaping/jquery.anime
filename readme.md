# jQuery CSS3 Animation Plugin
`jquery.anime` is a jquery css3 animation plugin that helping you to use css3 keyframes animation more easily and conveniently.It is particularly useful when you're working with some css3 animations library like [animate.css](https://github.com/daneden/animate.css) or [magic.css](https://github.com/miniMAC/magic).

# Usage
Just include `jquery.js`(1.6+) and `jquery.anime.js` in your page,then select the elements that you want to apply animation and call the `anime` method.
```html
<style>
@-webkit-keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}	
</style>

<div id="demo"></div>

<script src="yourpath/jquery.js"></script>
<script src="yourpath/jquery.anime.js"></script>

<script>
//apply fadeIn animation in one second on the element
$('#demo').anime('fadeIn', '1s', 'ease-out');
</script>
```
# Demo
There are some demos here [http://chaping.github.io/jquery-anime/](http://chaping.github.io/jquery-anime/)

# Documentation
## anime()

The `anime()` method's parameters are quite flexible, and they correspond to the css3 animation's property. The first parameter must always be the `animation-name` property, and the others can be in any order as you like.

`jquery.anime` decides which animation property your parameter belonged to, according to the parameter's format and content.For example,a number followed by a `s` character will be treated as a time parameter that can be applied to `animetion-duration` or `animation-delay`.If there are two time parameter,the first will be treated as `animetion-duration`,and the second will be treated as `animetion-delay`.If there are only one,it will be treated as `animetion-duration`.In addtion,jquery.anime() allow you to pass a function or a object to do extra work.There are some rules below.  

* animation-name : the first parameter will be treated as the `animation-name` property.
* animation-duration : a number followed by a `s` character or `ms`,such as `0.5s`, `1s`, `2s`.
* animation-timing-function : string match the regular pattern `/^(linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\(.+\))$/` will be treated as the `animation-timing-function` property. 
* animation-delay : a number followed by a `s` character or `ms`,such as `0.5s`, `1s`, `2s`.
* animation-iteration-count : a positive integer number such as `1`,`2`, or a string `infinite`,which represents for repeating forever.
* animation-direction : `normal` and `alternate`.
* animation-fill-mode : `none`,`forwards`,`backwards`,`both`.
* animation-play-state : `pause` and `runing`.  
* animation end event callback : if your parameter is a function,then it will be treated as the `animationend` event's listener.It will be called when the animation ends.
* css object : if your parameter is a plain object,jquery.anime will call jquey's `css()` method and pass the object to it before applying animation.This is useful when you want to set some css property on the element before animation. 
Except for the first parameter,all parameters are optional.If the parameter is not set,it will use initial value. 

```js
$('#demo').anime('fadeIn', '1s'); //apply fadeIn animation in a second
$('#demo').anime('fadeIn', '1s', '2s');//delay two seconds before the animation starts
$('#demo').anime('fadeIn', '1s', 'ease-in');//use the ease-in timing function
$('#demo').anime('fadeIn', '1s', 2);//apply fadeIn animation in a second and repeat twice
$('#demo').anime('fadeIn', '1s', 'infinite');//apply fadeIn animation in a second and repeat forever
$('#demo').anime('fadeIn', '1s', 'infinite', 'alternate');//the animation will play in reverse on all cycles
$('#demo').anime('fadeIn', '1s', 'both');//apply animation with animation-fill-mode set to both

//a callback when the aimation ends
$('#demo').anime('fadeIn', '1s', function(){
	alert('aniamtion ends!');
});

//do some css initial work before applying animation 
$('#demo').anime('fadeIn', '1s', {
	display : 'block',
	height : '100px'
});

//The first parameter must be the animation-name,and other parameters' order is not important.The all three lines codes below have the same effect.
$('#demo').anime('fadeIn', '1s', 'ease-out', '2s', 2, 'both', 'alternate', function(){});
$('#demo').anime('fadeIn', 'ease-out', 2, '1s', '2s', 'alternate', function(){}, 'both');
$('#demo').anime('fadeIn', function(){}, 'both', '1s', 2, 'alternate', '2s', 'ease-out');
```

## $.fn.delay()
`jquery.anime` based on jQuery's queue system,so you can use the `delay()` method provided by jQuery.
```js
$('#demo').delay(500).anime('fadeIn', '1s'); //delay 500ms before apply the animation
```

## $.fn.then()
`then` is a method provided by jquery.anime,usually we can use it after the `anime()` method, and then call another `anime()` method after it,the latter `anime()` will be called only when the former `anime()` animation ends.
```js
//apply the shake animation after the fadeIn animation ends.
$('#demo').anime('fadeIn', '1s').then().anime('shake', '1s');

//apply a series of animations one by one
$('#demo').anime('fadeIn', '1s').then()
          .anime('shake', '1s').then()
          .anime('wobble', '1s').then()
          .anime('flash', '1s');
``` 
## clear and cancel animations
You can use `anime('none')` to clear an element's animation.  
```
$('#demo').anime('none');
```
If you want to cancel animations caused by `delay()` and `then()`,you can use jQuery's `clearQueue()` method.
```
$('#demo').delay(1000).anime('fadeIn', '1s'); //delay animation
$('#demo').clearQueue(); //cancel animation
```

## $.keyframes
You can use `$.keyframes([name,] keyframes)` to create css3 keyframes aniamtion dynamically.
```js
//create a keyframes aniamtion named 'fadeIn' 
$.keyframes('fadeIn', {
	'0%' : { opacity: 0; },
	'100%' : { opacity: 1; }	
});

//or specify the name in the object
$.keyframes({
	'name' : 'fadeIn',
	'0%' : { opacity: 0; },
	'100%' : { opacity: 1; }	
});

//or not specify the name,and $.keyframes will generate a name automatically and return it for you.
var animationName = $.keyframes({
	'0%' : { opacity: 0; },
	'100%' : { opacity: 1; }
}); //the returned animation name will be something like 'anime_animation xx'
```

when use some transform perporty,you can do it like that 
```js
$.keyframes('myAnimation', {
	'0%' : { x:0, y:0, scale:1, rotate:0 }, //equal to { tansform:translate(0,0) scale(1) rotate(0) }
	'100%' : { x:100, y:100, scale:2, rotate:90 }//equal to { tansform:translate(100px,100px) scale(2) rotate(90deg) }
});

$.keyframes('shake', {
	'0%, 100%' : { translate3d : '0, 0, 0' },
	'10%, 30%, 50%, 70%, 90%' : { translate3d: '-10px, 0, 0' },
	'20%, 40%, 60%, 80%' : { translate3d : '10px, 0, 0' }	
});
```

The animation created by `$.keyframes` can be used by `$.fn.anime`, you can even pass a keyframes object as the `anime()`'s first parameter.
```js
//if the first parameter is not a string but a plain object,then it will be passed to $.keyframes() and return the animation name. 
$('#demo').anime({
	'0%' : { opacity: 0; },
	'100%' : { opacity: 1; }	
}, '1s');
```

# License
Licensed under the MIT license.









