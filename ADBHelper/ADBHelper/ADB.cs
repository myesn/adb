using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ADBHelper
{
    public class ADB
    {
        private readonly string _adbPath;
        private string _serialNumber = "343a7d03";

        public ADB(string adbPath)
        {
            _adbPath = adbPath;
        }

        public Task<string> DumpsysPower(DumpsysPowerKey key)
        {
            return RunADBAsync($"adb shell dumpsys power | find \"{key}=\"", _serialNumber);
        }

        public Task InputSwipe(int startX, int startY, int endX, int endY, int? duration = null)
        {
            return null;
            //return RunADBAsync($"shell input swipe {startX} {startY} {endX} {endY}");
        }

        public Task InputKeyEvent(KeyCode keyCode)
        {
            return null;
            //return RunADBAsync($"shell input keyevent {(int)keyCode}");
        }


        private Task<string> RunADBAsync(string command, string serialnumber)
        {
            var tcs = new TaskCompletionSource<string>();
            var process = new Process
            {
                StartInfo =
                {
                    FileName = "cmd",
                    Arguments = CommandParser(command, serialnumber),
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    ErrorDialog = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    RedirectStandardInput = true,
                    StandardOutputEncoding = Encoding.UTF8,
                    //StandardErrorEncoding = Encoding.UTF8
                },
                EnableRaisingEvents = true
            };
            //process.OutputDataReceived += Process_OutputDataReceived;
            process.Start();

            process.StandardInput.WriteLine(CommandParser(command, serialnumber));

            process.Exited += (sender, args) =>
            {
                Console.WriteLine("Exited");
                tcs.TrySetResult(string.Empty);

                process.Dispose();
            };


            var output = string.Empty;
            while (!process.StandardOutput.EndOfStream)
            {
                output += process.StandardOutput.ReadLine();
            }

            tcs.SetResult(output);

            //process.WaitForExit();
            //process.Dispose();

            return tcs.Task;
        }

        private void Process_OutputDataReceived(object sender, DataReceivedEventArgs e)
        {
            throw new NotImplementedException();
        }

        private static string CommandParser(string command, string serialnumber)
        {
            if (command.StartsWith("adb "))
            {
                command = command.Remove(0, 4);

                if (command.Contains("shell"))
                {
                    command = command.Remove(0, 5);
                    command = "exec-out" + command;
                }

                if (command.StartsWith("logcat")) command = "exec-out " + command;

                var serial = "";

                if (!string.IsNullOrEmpty(serialnumber))
                    serial += "-s " + serialnumber + " ";
                else
                    serial = "";

                var fullcommand = "adb " + serial + command;

                return fullcommand;
            }

            if (!command.StartsWith("fastboot ")) return command;
            {
                command = command.Remove(0, 9);

                var fullcommand = "fastboot " + command;

                return fullcommand;
            }
        }
    }

    //https://developer.android.com/reference/android/view/KeyEvent.html
    public enum KeyCode
    {
        Home = 3,
        Power = 26,
        Enter = 66,
        Menu = 82,
        Sleep = 223,
        Wakeup = 224
    }

    public enum DumpsysPowerKey
    {
        /// <summary>
        /// <para>屏幕唤醒状态</para>
        /// <para>屏幕已唤醒：Awake</para>
        /// <para>屏幕已休眠：Asleep</para>
        /// </summary>
        mWakefulness,

        /// <summary>
        /// <para>屏幕解锁状态</para>
        /// <para>已解锁：true</para>
        /// <para>未解锁：false</para>
        /// </summary>
        mHoldingWakeLockSuspendBlocker
    }
}
