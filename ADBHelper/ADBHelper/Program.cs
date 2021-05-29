using System;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace ADBHelper
{
    class Program
    {
        private const string _adbPath = @"C:\caches\adb\platform-tools_r29.0.6-windows\platform-tools\adb.exe";


        static async Task Main(string[] args)
        {
            // https://github.com/labo89/adbGUI


            //adb shell dumpsys power | find "mWakefulness"
            //Process.Start("adb", "shell dumpsys power | find \"mWakefulness\"");

            
            var adb = new ADB(_adbPath);

            //await adb.InputKeyEvent(KeyCode.Wakeup);
            //await adb.InputSwipe(360, 1000, 360, 500);
            while (true)
            {
                var mWakefulness = await adb.DumpsysPower(DumpsysPowerKey.mWakefulness);
                var mHoldingWakeLockSuspendBlocker = await adb.DumpsysPower(DumpsysPowerKey.mHoldingWakeLockSuspendBlocker);

                Console.WriteLine($"屏幕唤醒状态：{mWakefulness}");
                Console.WriteLine($"屏幕解锁状态：{mHoldingWakeLockSuspendBlocker}");
                Console.ReadKey();
            }


            //https://android.stackexchange.com/questions/191086/adb-commands-to-get-screen-state-and-locked-state
            Console.WriteLine("Hello World!");
        }


    }


}
