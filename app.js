///currently moving slider
var crSlider = null;

$(document).ready(function(){
	//number inputs
	$('input[type="number"].color').change(function(e){
		if (this.value < 0) this.value = 0;
		else if (this.value > 255) this.value = 255;
		updateSliders();
		$.ajax({
			method: 'POST',
			url: '/rpc',
			dataType: 'json',
			data: {
				cmd: 'setcolor',
				red: $('input.color#red').val(),
				green: $('input.color#green').val(),
				blue: $('input.color#blue').val()
			}
		});
	});
	$('input[type="number"]#brightness').change(function(e){
		if (this.value < 0) this.value = 0;
		else if (this.value > 255) this.value = 255;
		updateSliders();
		$.ajax({
			method: 'POST',
			url: '/rpc',
			dataType: 'json',
			data: {
				cmd: 'setbrightness',
				b: $('input#brightness').val(),
			}
		});
	});
	
	//color sliders
	$('div#colors div.slider').mousedown(function(e){
		if (e.target == this) {
			var v = (e.pageX-$(this).offset().left)/$(this).innerWidth()*255;
			$('input#'+this.classList[1]).val(Math.round(v)).trigger('change');
			crSlider = this.classList[1];
		}
	});
	$(document).mousemove(function(e){
		if (crSlider) {
			var s = $('div.slider.'+crSlider);
			var v = Math.round((e.pageX-s.offset().left)/s.innerWidth()*255);
			if (v < 0) v = 0;
			if (v > 255) v = 255;
			$('input#'+crSlider).val(v).trigger('change');
		}
	});
	$(document).mouseup(function(e){
		crSlider = null;
	});
	$('div#colors div.slider > div.but').mousedown(function(){
		crSlider = this.classList[1];
	});
});

function updateSliders() {
	$('div.slider div.but.red').css('left', $('input.color#red').val()/2.55+'%');
	$('div.slider div.but.green').css('left', $('input.color#green').val()/2.55+'%');
	$('div.slider div.but.blue').css('left', $('input.color#blue').val()/2.55+'%');
	$('div.slider div.but.brightness').css('left', $('input#brightness').val()/2.55+'%');
	
	//generate preview color
	var c = '#';
	var v = Number($('input.color#red').val()).toString(16);
	c+=(v.length < 2 ? '0' : '')+v;
	var v = Number($('input.color#green').val()).toString(16);
	c+=(v.length < 2 ? '0' : '')+v;
	var v = Number($('input.color#blue').val()).toString(16);
	c+=(v.length < 2 ? '0' : '')+v;
	$('div#colors div.preview').css('background', c);
}
