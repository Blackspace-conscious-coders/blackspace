document.getElementById('woke').onclick = function () {
	
	$('#wokeshops').fadeToggle(1000,function(){
		$('#wokeshops').toggleClass('hidden')
	}) 
};

$(document).ready(function(){
	if($('.active').hasClass('navwokeshop')){
		$('#woke').trigger('click');
	}	
});