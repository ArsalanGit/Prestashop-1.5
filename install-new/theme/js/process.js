var is_installing = false;
$(document).ready(function()
{
	$("#loaderSpace").unbind('ajaxStart');
	start_install();
});

current_step = 0;
function start_install()
{
	// If we are already installing PrestaShop, do not trigger action again
	if (is_installing)
		return;
	is_installing = true;
	
	$('.process_step').removeClass('fail').removeClass('success').hide();
	$('.error_log').hide();
	$('#progress_bar').show();
	$('#progress_bar .installing').show();
	process_install();
}

function process_install(step)
{
	if (!step)
		step = process_steps[0];

	$('.installing').hide().html(step.lang+' ...').fadeIn('slow');

	$.ajax({
		url: 'index.php',
		data: step.key+'=true',
		dataType: 'json',
		cache: false,
		success: function(json)
		{
			// No error during this step
			if (json.success)
			{
				$('#process_step_'+step.key).show().addClass('success');
				current_step++;
				if (current_step >= process_steps.length)
				{
					$('#progress_bar .total .progress').animate({'width': '100%'}, 500);

					// Installation finished
					setTimeout(function()
					{
						install_success();
					}, 700)
				}
				else
				{
					$('#progress_bar .total .progress').animate({'width': '+='+process_percent+'%'}, 500);

					// Process next step
					process_install(process_steps[current_step]);
				}
			}
			// An error occured during this step
			else
			{
				install_error(step.key, json.message);
			}
		},
		// An error HTTP (page not found, json not valid, etc.) occured during this step
		error: function()
		{
			install_error(step.key);
		}
	});
}

function install_error(step, errors)
{
	current_step = 0;
	is_installing = false;
	$('#process_step_'+step.key).show().addClass('fail');
	$.each(process_steps, function(k, v)
	{
		$('#progress_bar_'+v.key).removeClass('complete');
	});
	
	if (errors)
	{
		var list_errors = errors;
		if ($.type(list_errors) == 'string')
			list_errors = [list_errors];
		
		var display = '<ol>';
		$.each(list_errors, function(k, v)
		{
			display += '<li>'+v+'</li>';
		});
		display += '</ol>';
		$('#process_step_'+step.key+' .error_log').html(display).show();
	}
}

function install_success()
{
	$('.installing').html(install_is_done);
	is_installing = false;
	$('#install_process_form').slideUp();
	$('#install_process_success').slideDown();
}