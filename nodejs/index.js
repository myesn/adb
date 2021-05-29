const execa = require('execa');

(async () => {
	const adbPath = 'C:\\caches\\adb\\platform-tools\\adb.exe';
	
	const weakUpCommand = 'shell input keyevent 224';
	var swipeCommand = 'shell input swipe 360 1000 360 500';
	var commandArray = 'shell dumpsys power | find "mWakefulness="';//屏幕唤醒状态
	var mWakefulnessCommand = 'shell dumpsys power | find "mWakefulness="';//屏幕唤醒状态
	var mHoldingWakeLockSuspendBlockerCommand = 'shell dumpsys power | find "mHoldingWakeLockSuspendBlocker="';//屏幕解锁状态
	
	// await execa('cmd /c', [ adbPath, weakUpCommand],{
	// 	shell: true
	// });

	// await execa('cmd /c', [ adbPath, swipeCommand],{
	// 	shell: true
	// });

	const result = await execa('cmd /c', mWakefulnessCommand,{
		shell: true
	});
	console.log(result);
	const result2 = await execa('cmd /c', mHoldingWakeLockSuspendBlockerCommand,{
		shell: true
	});
	console.log(result2);
	//=> 'unicorns'
})();