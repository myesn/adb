//-------------------------------------------------------------------------------------------------//脚本参数
//服务端地址
var serverUrl="http://pnjjc4.natappfree.cc/";
//主号应用名称
var mainApp="好玩吧";
//解锁密码
var unLockPass=[1,4,7,8,9,6];
//是否开启解锁
var openUnLock=false;
//app运行超时时间[毫秒]
var timeOut=10*60*1000; //默认10分钟
//应用容忍失败次数
var maxFailTime=2;
//--------------------------------------------------------------------------------------------------//脚本参数



var res =http.get(serverUrl+"/app/appList");
handleHttpResult(res);
var apps =res.body.json().data;
console.log(apps);

//全局屏幕宽度、高度
var width=device.width;
var height=device.height;

//唤醒解锁屏幕
if(openUnLock){
    doUnLock();
}
home();
sleep(1000);
closeApp();
//检查是否启动无障碍模式
auto.waitFor();
for(i=0;i<apps.length;i++){
    console.log(apps[i]+"---------------------------------");
    var failTime=0;
    while(!startThreadRunApp(apps[i])){
        sleep(500);
        failTime++;
        if(failTime==maxFailTime){//设置app失败两次就直接跳过
            break;
            console.log(apps[i]+":失败两次直接跳过");
        }
    }
    console.log("执行完毕["+apps[i]+"]");
}
sleep(5000);//完成一个APP后休息5秒钟
console.log("完毕提示：所有应用都结束了！！！！！！！！！！！！！！");
toast("所有应用都结束了");

/**
 * 处理http返回结果
 * @param {*} res 
 */
function handleHttpResult(res){
    if(res.statusCode != 200){
        toast("请求失败服务端失败，需要检查服务端是否正确");
        console.error("请求失败: " + res.statusCode + " " + res);
    }
}
/**
 * 开启一个线程运行app
 * @param {*} appName 
 */
function startThreadRunApp(appName){
    if(appName==mainApp){//如果是主号，超时时间翻倍
        timeOut=timeOut*2;
    }
    console.log("开启子线程执行["+appName+"]");
    var start = new Date().getTime();
    try{
        var sonThread = threads.start(function(){
            startApp(appName);
        });
        console.log("主线程进入等待.............");
        sonThread.join(timeOut);//如果子线程过久没有执行完成,则主线程继续运行
        var end =new Date().getTime();
        console.log("主线程等待完毕,耗时："+(end-start)+"mm");
    }catch(error){
        console.log(appName+":运行错误了,需要重新运行");
        console.log(error);
        closeApp();
        var res = http.post(serverUrl+"/app/addLog", {
            "appName": appName,
            "isOk": "false",
            "log": "运行报错===>"+error
        });
        handleHttpResult(res);
        return false;
    }
    if(end-start>=timeOut){//如果子线程消耗时间>=超时时间则需要重新执行
        sonThread.interrupt();//结束子线程避免多个子线程
        closeApp();
        console.log(appName+":超时了,需要重新运行");
        var res = http.post(serverUrl+"/app/addLog", {
            "appName": appName,
            "isOk": false,
            "log": "运行超时，需要重新运行"
        });
        handleHttpResult(res);
        return false;
    }else{
        sonThread.interrupt();//结束子线程避免多个子线程
        var res = http.post(serverUrl+"/app/addLog", {
            "appName": appName,
            "isOk": "true",
            "log": "运行完毕"
        });
        handleHttpResult(res);
        return true;
    }
}

/**
 * 开始应用
 * @param {*} appName 
 */
function startApp(appName){
    console.log("------------[appName:"+appName+"] 开始运行------------");
    var status=app.launchApp(appName);
    if(status){
        console.log("["+appName+"]运行成功");
    }else{
        console.log("["+appName+"]应用不存在");
        var res = http.post(serverUrl+"/app/addLog", {
            "appName": appName,
            "isOk": "false",
            "log": "运行失败，应用不存在"
        });
        handleHttpResult(res);
        return;
    }
    sleep(5000);
    var welcome=text("跳过").findOnce();
    if(welcome!=null){
        var welcomeRect=welcome.bounds();
        click(welcomeRect.centerX(),welcomeRect.centerY());
    }
    //<<我知道>>弹窗处理

    var iknow=text("我知道了").findOne();
    console.log("我知道了");
    if(iknow!=null){
        var iknowRect=iknow.bounds();
        click(iknowRect.centerX(),iknowRect.centerY());
    }

    //挖钻石
    sleep(2000);
    console.log("挖钻石");
    var diamond=text("开始").findOnce();
    if(diamond!=null){
        var diamondRect=diamond.bounds();
        while(text("剩余").findOnce()!=null||text("今日已领取").findOnce()!=null){
            click(diamondRect.centerX(),diamondRect.centerY())
            sleep(2000);
        };
    }
    //领取钻石
    var diamondGet=text("点击领取").findOnce();
    if(diamondGet!=null){
        var diamondGetRect=diamondGet.bounds();
        while(text("剩余").findOnce()!=null||text("今日已领取").findOnce()!=null){
            click(diamondGetRect.centerX(),diamondGetRect.centerY())
            sleep(2000);
        };
    }

    //刷荣誉值
    //1、点击每日任务
    sleep(2000);
    var daylyWork=text("每日任务").findOne();
    console.log("每日任务");
    var daylyWorkRect=daylyWork.bounds();
    click(daylyWorkRect.centerX(),daylyWorkRect.centerY());

    //2、开始做任务
    sleep(2000);
    while(doWork(appName)){
        sleep(2000);
    };
    toast(appName+"任务已完成");
    var res = http.post(serverUrl+"/app/addLog", {
        "appName":appName,
        "isOk":"true",
        "log":"任务已完成"
    });
    handleHttpResult(res);
    sleep(500);
    closeApp();
    home();//回到桌面
    console.log("------------[appName:"+appName+"] 结束运行------------");
}
/**
 * 获取加载完毕参考点
 */
function getMark(){
    return text("看视频(荣誉值)").findOne();
}

/**
 * 做任务
 * @param {*} appName 
 */
function doWork(appName){
    getMark();
    console.log("做任务");
    //点击去完成
    var finishIndex=2;//小号只做荣誉值就行了
    if(appName==mainApp){//大号需要做荣誉值和贡献值
        finishIndex=1;
    }
    if(text("去完成").findOnce(finishIndex)==null){
        console.log("任务已完成");
        return false;//任务已完成
    }
    var workBtnRect=text("去完成").findOnce(1).bounds();
    // console.log(workBtnRect.centerX());//849-957
    // console.log(workBtnRect.centerY());//1753,1802
    while(text("看视频(荣誉值)").findOnce()!=null){//自旋点击，防止点击失败
        if(click(workBtnRect.centerX(),workBtnRect.centerY())){
            console.log("点击去完成成功");
        }else{
            console.log("点击去完成失败");
        }
        sleep(2000);
    }
    console.log("点击看视频成功，开始等待10s....");
    sleep(10000);//休眠
    console.log("看视频等待结束")
    //检测视频是否因网络问题卡住
    if(className("android.view.View").clickable(false).drawingOrder(4).findOnce(1000)){
        console.log("检测到视频未响应")//检测到视频未响应
        back(); //返回
        sleep(1000);
        console.log("点击返回按钮成功")
        doWork(appName); //继续执行工作
    }else{
        console.log("正在播放广告,继续等待....");
    }

    //点击关闭视频按钮
    while (true) {
        if (className("android.widget.ImageView").clickable(true).drawingOrder(2).findOne(1000)) {
            关闭 = className("android.widget.ImageView").clickable(true).drawingOrder(2).findOne(500);
            关闭.click();
            log("点击完=》关闭");
            sleep(2000)
            break;
        };
        if (className("android.widget.RelativeLayout").clickable(true).drawingOrder(6).findOne(1000)) {
            关闭 = className("android.widget.RelativeLayout").clickable(true).drawingOrder(6).findOne(500);
            关闭.click();
            log("点击完=》关闭");
            sleep(2000) 
            break;
        };
    };
    //点击返回按钮
   //while(!clickReturnBtn());
    return true;
}

/**
 * 点击返回按钮
 */
// function clickReturnBtn(){
//     var reBtn=getReturnBtn();
//     if(reBtn!=null){
//         while(text("看视频(荣誉值)").findOnce()==null){
//             reBtn.click();
//             console.log("点击返回按钮");
//             sleep(3000);
//         }
//         return true;
//     }
//     return false;
// }
/**
 * 获取返回按钮
 */
// function getReturnBtn(){
//     var reBtn;
//     reBtn=className("ImageView").boundsInside(0,0,width,height*0.12).clickable(true).drawingOrder(2).findOnce();
//     if(null==reBtn){
//         reBtn=className("RelativeLayout").boundsInside(0,0,width,height*0.12).clickable(true).drawingOrder(6).findOnce();
//     }
//     console.log("获取返回按钮");
//     sleep(2000);
//     return reBtn;
// }
/**
 * 关闭应用
 * @param {*} appName 
 */
function closeApp(appName){
    recents();
    sleep(1500);
    var btn=id("clear_all_recents_image_button"). findOne();
    btn. click();
}
/**
 * 唤醒解锁手机
 */
function doUnLock(){
    console.log("唤醒解锁手机");
    device.wakeUpIfNeeded();
    sleep(2000);
    swipe(width/2,height-500,width/2,0,random(16,18*50));
    for(i=0;i<unLockPass.length;i++){
        desc(unLockPass[i]).findOne().click();
        sleep(500);
    }
}