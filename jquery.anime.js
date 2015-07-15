;(function($,undefined){
	var prefix = getPrefix(), //浏览器前缀
		animationendName = getAnimationendEvent(prefix); //动画结束事件名
	$.fn.anime = function(name,duration,ease,delay,iteration,direction,state,mode,cssValue,onComplete){
		var that = this,
			args = parseArgs(Array.prototype.slice.call(arguments,0)); //解析出来的参数

		args.css = convertCSSValues(args.css); //转换特殊属性

		this.each(function(){
			$(this).queue(function(){
				var currentAnimationName = args['css'][prefix+'animation-name']; //当前的动画名
				if(!$(this).data('registerAnimationEnd')){
					$(this).bind(animationendName,function(e){
						//根据动画名称触发一个自定义事件
						var aniName = e.originalEvent.animationName;
						$(this).trigger('animationend:'+aniName,[e.originalEvent]);
						$(this).trigger('animationend:then:'+aniName);
					});
					$(this).data('registerAnimationEnd',1);
				}
				var customEventName = 'animationend:' + currentAnimationName;
				if(args['callback']){//需要动画完成时的回调
					$(this).unbind(customEventName).bind(customEventName,args['callback']); //bind前先unbind一次，保证同一个元素同一个名字的动画永远只有一个回调函数
				}else{
					$(this).unbind(customEventName); //清除之前注册的回调
				}
				$(this).data('currentAnimationName',currentAnimationName) //储存当前的动画名称
					   .css(prefix+'animation','none') //这样才能能重复调用同一个动画
					   .css(args['css'])
				       .dequeue();
			});
		});
		return this;
	}

	$.fn.then = function(){
		this.each(function(){
			$(this).queue(function(next){
				var currentAnimationName = $(this).data('currentAnimationName');
				if(currentAnimationName){
					var thenEvent = 'animationend:then:' + currentAnimationName;
					$(this).unbind(thenEvent).bind(thenEvent,next);
				}
			});
		});
		return this;
	}
	//不支持动画
	if(prefix===null){
		$.fn.anime = function(){}
	}

	function parseArgs(args){//参数解析
		var cssValues = {},
			callback = null;
		if($.isPlainObject(args[0])){//第一个参数是对象
			args[0] = $.keyframes(args[0]); //动态生成关键帧动画
		}	
		cssValues[prefix+'animation-name'] = args[0];//第一个参数必须是animationName
		for(var i=1, len=args.length; i<len; i++){
			var arg = args[i];
			if(typeof arg === 'string' && /ms$|s$/.test(arg)){//为duration或delay
				!cssValues[prefix+'animation-duration'] ? cssValues[prefix+'animation-duration'] = arg : cssValues[prefix+'animation-delay'] = arg;
			}else if(typeof arg === 'string' && /^(linear|ease|ease\-in|ease\-out|ease\-in\-out|cubic\-bezier\(.+\))$/.test(arg)){//缓动类型
				cssValues[prefix+'animation-timing-function'] = arg;
			}else if(typeof arg === 'number' || /^\d+$/.test(arg) || arg==='infinite'){//循环次数
				cssValues[prefix+'animation-iteration-count'] = arg + '';
			}else if(typeof arg === 'string' && /^(normal|alternate)$/.test(arg)){//方向
				cssValues[prefix+'animation-direction'] = arg;
			}else if(typeof arg === 'string' && /^(pause|runing)$/.test(arg)){//动画播放状态
				cssValues[prefix+'animation-play-state'] = arg;
			}else if(typeof arg === 'string' && /^(none|forwards|backwards|both)$/.test(arg)){ //动画之外的状态
				cssValues[prefix+'animation-fill-mode'] = arg;
			}else if($.isPlainObject(arg)){//额外css参数
				$.extend(cssValues,arg);
			}else if($.isFunction(arg)){//动画完成时的回调
				callback = arg;
			}
		}
		return {
			css : cssValues,
			callback : callback
		}
	}


	function getPrefix(){
		var div = document.createElement('div');
			style = div.style;
		if('animation' in style) return '';
		var prefixs = ['Webkit','Moz','O','ms'];
		for(var i=0; i<prefixs.length; i++){
			if(prefixs[i]+'Animation' in style) return '-' + prefixs[i].toLowerCase() + '-';
		}
		return null;
	}

	function getAnimationendEvent(prefix){
		if(typeof prefix=='undefined') prefix = getPrefix();
		if(prefix==='') return 'animationend';
		var map = {
			'-webkit-' : 'webkitAnimationEnd',
			'-moz-' : 'animationend',
			'-ms-' : 'MSAnimationEnd',
			'-o-' : 'oanimationend'
		}
		return map[prefix];
	}


	/******关键帧操作***************************************************/
	var keyframesRules = {}; //已经生成的动画规则集合，键名为动画名
	var styleElem,styleSheet;
	$.keyframes = function(name,frames){
		if(typeof name == 'object'){
			frames = name;
			if(!frames.name) name = 'anime_animation' + setTimeout('0');
		}
		if(frames.name) name = frames.name;
		if(!styleElem) KeyframeInit();
		if(keyframesRules[name]) replaceKeyframesRule(name, frames);
		else createKeyframesRule(name, frames);
		return name;
	}
	//不支持动画
	if(prefix===null){
		$.keyframes = function(){}
	}

	//新建动画规则，name为动画名，frames为帧数据对象
	function createKeyframesRule(name,frames){
		var framesText = generateKeyframesText(frames);
		//http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
		var index = styleSheet.insertRule('@'+prefix+'keyframes ' + name + framesText, styleSheet.cssRules.length);
		keyframesRules[name] = styleSheet.cssRules[index];
	}

	//替换已有的动画规则，name为动画名，frames为帧数据对象
	function replaceKeyframesRule(name,frames){
		var framesText = generateKeyframesText(frames);
		if(keyframesRules[name]){//删除已有的
			var cssRules = styleSheet.cssRules;
			for(var i=0, len=styleSheet.cssRules.length; i<len; i++){
				if(cssRules[i]===keyframesRules[name]){
					styleSheet.deleteRule(i);
					break;
				}
			}
		}

		var index = styleSheet.insertRule('@'+prefix+'keyframes ' + name + framesText, styleSheet.cssRules.length);
		keyframesRules[name] = styleSheet.cssRules[index];
	}

	//修改某个动画中某一帧的规则,name为动画名，keyText为帧名，比如0%，bodyText为css文本,如{color:#fff}
	//TODO:目前使用的appendRule这样的方法会追加在原有的后面，不管帧名是否已经存在,要改进的话就是看看如果已经存在的，能不能用cssText属性去替换
	function modifyKeyframesRule(name,keyText,bodyText){
		if(!keyframesRules[name]) return false;
		var cssText = keyText + bodyText;
		//appendRule和insertRule: https://developer.mozilla.org/en-US/docs/Web/API/CSSKeyframesRule#Browser_compatibility
		if(keyframesRules[name].appendRule) keyframesRules[name].appendRule(cssText);
		else keyframesRules[name].insertRule(cssText);
	}

	//根据传入的对象生成keyframe语句
	//{
	//	'0%' : { width : 100px, height : 100px  },
	//	'100%' : { width : 0, height : 0 }
	//}
	function generateKeyframesText(frames){
		var framesText = '{';
		for(var k in frames){
			frames[k] = convertCSSValues(frames[k]); //转换特殊属性
			var cssText = '{';
			for(var p in frames[k]){
				cssText += p + ':' + frames[k][p] + ';'
			}
			cssText += '}';
			framesText += k + cssText;
		}
		framesText += '}';
		return framesText;
	}


	function KeyframeInit(){
		if(!styleElem){
			styleElem = document.createElement('style');
			styleElem.rel = 'stylesheet';
            styleElem.type = 'text/css';
			var head = document.head || document.getElementsByTagName('head')[0];
			head.appendChild(styleElem);
			styleSheet = styleElem.sheet;
		}
	}

	//抽出transform属性
	var rTransformProp = /^(translate(?:3d)?|scale(?:3d)?|rotate(?:3d)?|skew)?([XYZxyz])?$/;
	//抽出transform属性值
	var rTransformValue = /\(?\s*([^\,\s\)]+)(?:\s*\,\s*([^\,\s\)]+))?(?:\s*\,\s*([^\,\s\)]+))?\s*\)?/;

	//转换数据中的特殊属性
	function convertCSSValues(obj){
		var transform = null;
		for(var p in obj){
			if(!obj.hasOwnProperty(p)) continue;
			var match = p.match(rTransformProp);
			if(match){
				if(!transform) transform = new Transform();
				var match2 = String(obj[p]).match(rTransformValue);
				transform.set(match[1],match[2],match2[1],match2[2],match2[3]);
				delete obj[p];
			}
		}
		if(transform) obj[prefix+'transform'] = transform.toString();
		return obj;
	}

	//用来生成transform的对象
	function Transform(){

	}

	//设置transform属性
	Transform.prototype.set = function(prop,axis,value1,value2,value3){
		if(!prop) prop = 'translate'; //单独的x,y,z表示的是translate属性
		var is3d = /3d$/.test(prop); //是否3d变换
		if(is3d) prop = prop.replace('3d','');
		if(prop==='rotate' && !is3d && !axis) this[prop] = this.unit(prop,value1); //单独处理rotate属性
		else if(axis) this[prop+axis.toUpperCase()] = this.unit(prop,value1); //指定了变换方向
		else{
			this[prop+'X'] = this.unit(prop,value1);
			this[prop+'Y'] = value2===undefined ? this.unit(prop,value1) : this.unit(prop,value2);
			if(is3d && prop!=='skew'){ //3d变换,skew没有3d变换
				if(value3!==undefined) this[prop+'Z'] = this.unit(prop,value3);
				else this[prop+'Z'] = this.unit(prop,value1);
			}
		}
	}

	//自动补全单位
	Transform.prototype.unit = function(prop,value){
		if(prop.indexOf('scale')===0) value = parseFloat(value);
		else{
			if(/\d$/.test(value)) value += /^(?:rotate|skew)/.test(prop) ? 'deg' : 'px'; //没有单位的自动加上单位
		}
		return value;
	}

	//返回transform字符串
	Transform.prototype.toString = function(){
		var str = '';
		for(p in this){
			if(!this.hasOwnProperty(p) || p=='skewZ') continue; //skew没有3D变换
			str += (str?' ':'') + p + '(' +this[p] + ')';
		}
		console.log(str);
		return str;
	}

	//侦测是否支持3d变换
	//http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
	function support3d(){
		if (!window.getComputedStyle) {
	        return false;
	    }

	    var el = document.createElement('p'), 
	        has3d,
	        transforms = {
	            'webkitTransform':'-webkit-transform',
	            'OTransform':'-o-transform',
	            'msTransform':'-ms-transform',
	            'MozTransform':'-moz-transform',
	            'transform':'transform'
	        };

	    // Add it to the body to get the computed style.
	    document.body.insertBefore(el, null);

	    for (var t in transforms) {
	        if (el.style[t] !== undefined) {
	            el.style[t] = "translate3d(1px,1px,1px)";
	            has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
	        }
	    }

	    document.body.removeChild(el);

	    return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
	}

})(jQuery);