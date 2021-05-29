﻿// This is an open source non-commercial project. Dear PVS-Studio, please check it.
// PVS-Studio Static Code Analyzer for C, C++ and C#: http://www.viva64.com

namespace adbGUI.Forms
{
    using System;
    using System.Windows.Forms;
    using Methods;

    public partial class InstallUninstall : Form
    {
        private readonly CmdProcess _adb;
        private readonly FormMethods _formMethods;

        public InstallUninstall(CmdProcess adbFrm, FormMethods formMethodsFrm)
        {
            InitializeComponent();

            _adb = adbFrm;
            _formMethods = formMethodsFrm;
        }

        private void Btn_InstallUninstallInstall_Click(object sender, EventArgs e)
        {
            var s = "\"" + txt_InstallUninstallPackageInstall.Text + "\"";

            if (txt_InstallUninstallPackageInstall.Text != "")
            {
                _adb.StartProcessing("adb install " + s, _formMethods.SelectedDevice());

                RefreshInstalledApps();
            }
            else
            {
                MessageBox.Show(@"Please select a file!", @"Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void Btn_InstallUninstallBrowse_Click(object sender, EventArgs e)
        {
            openFileDialog.FileName = "";
            openFileDialog.CheckFileExists = true;
            openFileDialog.CheckPathExists = true;
            openFileDialog.Filter = @" .apk|*.apk";

            if (openFileDialog.ShowDialog() == DialogResult.OK)
                txt_InstallUninstallPackageInstall.Text = openFileDialog.FileName;
        }

        private void Btn_InstallUninstallUninstall_Click(object sender, EventArgs e)
        {
            var s = "\"" + cbx_InstallUninstallPackageUninstall.SelectedItem + "\"";

            _adb.StartProcessing("adb uninstall " + s, _formMethods.SelectedDevice());

            RefreshInstalledApps();
        }

        private void Btn_InstallUninstallRefreshApps_Click(object sender, EventArgs e)
        {
            groupBox1.Enabled = false;
            groupBox3.Enabled = false;
            RefreshInstalledApps();
            groupBox1.Enabled = true;
            groupBox3.Enabled = true;
        }

        private void RefreshInstalledApps()
        {
            cbx_InstallUninstallPackageUninstall.Items.Clear();

            cbx_InstallUninstallPackageUninstall.Enabled = false;

            var output =
                CmdProcess.StartProcessingInThread("adb shell pm list packages -3", _formMethods.SelectedDevice());

            if (!string.IsNullOrEmpty(output))
            {
                foreach (var item in output.Split(new[] {"\n"}, StringSplitOptions.RemoveEmptyEntries))
                    cbx_InstallUninstallPackageUninstall.Items.Add(item.Remove(0, 8));

                cbx_InstallUninstallPackageUninstall.Sorted = true;

                if (cbx_InstallUninstallPackageUninstall.Items.Count > 0)
                    cbx_InstallUninstallPackageUninstall.SelectedIndex = 0;
            }


            cbx_InstallUninstallPackageUninstall.Enabled = true;
        }
    }
}