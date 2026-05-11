import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/dashboard.vue';
import Pools from '../views/pools.vue';
import Disks from '../views/disks.vue';
import Shares from '../views/shares.vue';
import Docker from '../views/docker.vue';
import Lxc from '../views/lxc.vue';
import Vm from '../views/vm.vue';
import Login from '../views/login.vue';
import FirstSetup from '../views/firstSetup.vue';
import DockerCreate from '../views/docker/dockerCreate.vue';
import DockerChange from '../views/docker/dockerChange.vue';
import DockerCompose from '../views/docker/dockerCompose.vue';
import LxcBackups from '../views/lxc/lxcBackups.vue';
import mosHub from '../views/mosHub.vue';
import profile from '../views/profile.vue';
import mosTools from '../views/mosTools.vue';
import mosToolsWebterminal from '../views/mosTools/webterminal.vue';
import mosToolsFilebrowser from '../views/mosTools/filebrowser.vue';
import mosSettings from '../views/mosSettings.vue';
import mosSettingsDocker from '../views/mosSettings/dockerService.vue';
import mosSettingsLXC from '../views/mosSettings/lxcService.vue';
import mosSettingsVm from '../views/mosSettings/vmService.vue';
import mosSettingsNetworkInterfaces from '../views/mosSettings/networkInterfaces.vue';
import mosSettingsNetworkServices from '../views/mosSettings/networkServices.vue';
import mosSettingsSystem from '../views/mosSettings/system.vue';
import mosSettingsCron from '../views/mosSettings/cron.vue';
import mosSettingsLogs from '../views/mosSettings/logs.vue';
import mosSettingsDrivers from '../views/mosSettings/drivers.vue';
import mosSettingsBoot from '../views/mosSettings/boot.vue';
import mosSettingsHub from '../views/mosSettings/mosHub.vue';
import mosSettingsSensors from '../views/mosSettings/sensors.vue';
import mosSettingsZram from '../views/mosSettings/zram.vue';
import mosSettingsToken from '../views/mosSettings/token.vue';
import mosSettingsUsers from '../views/mosSettings/users.vue';
import mosSettingsUsbDevices from '../views/mosSettings/usbDevices.vue';
import mosSettingsPciDevices from '../views/mosSettings/pciDevices.vue';
import mosSettingsSmart from '../views/mosSettings/smart.vue';
import mosSettingsNotifications from '../views/mosSettings/notifications.vue';
import webterminalPopup from '../views/webterminalPopup.vue';
import Notifications from '../views/notifications.vue';
import RemoteMounting from '../views/remoteMounting.vue';
import Plugins from '../views/plugins.vue';
import PluginView from '../views/pluginView.vue';
import Mfa from '../views/mfa.vue';

const routes = [
  { path: '', component: Dashboard, meta: { hideAppBar: false, title: 'Dashboard', description: 'Dashboard for your server' } },
  { path: '/login', component: Login, meta: { hideAppBar: false, title: 'MOS Login', description: 'Login to your server' } },
  { path: '/firstSetup', component: FirstSetup, props: true, meta: { hideAppBar: false, title: 'MOS First Setup', description: 'Set up your server for the first time' } },
  { path: '/dashboard', component: Dashboard, meta: { hideAppBar: false, title: 'Dashboard', description: 'Dashboard for your server' } },
  { path: '/pools', component: Pools, meta: { hideAppBar: false, title: 'Pools', description: 'Manage storage pools' } },
  { path: '/disks', component: Disks, meta: { hideAppBar: false, title: 'Disks', description: 'Manage disks in your server' } },
  { path: '/shares', component: Shares, meta: { hideAppBar: false, title: 'Shares', description: 'Manage shares in your server' } },
  { path: '/remoteMounting', component: RemoteMounting, meta: { hideAppBar: false, title: 'Remote Mounting', description: 'Manage remote mounting' } },
  { path: '/docker', component: Docker, meta: { hideAppBar: false, title: 'Docker', description: 'Manage Docker containers' } },
  {
    path: '/docker/create',
    component: DockerCreate,
    props: (route) => ({
      template: route.query.template || '',
    }),
    meta: { hideAppBar: false, title: 'Create Docker', description: 'Create a new Docker container' },
  },
  { path: '/docker/change/:docker', component: DockerChange, props: true, meta: { hideAppBar: false, title: 'Change Docker', description: 'Change Docker container settings' } },
  {
    path: '/docker/compose',
    component: DockerCompose,
    props: (route) => ({ template: route.query.template || '', yaml: route.query.yaml || '', env: route.query.env || '' }),
    meta: { hideAppBar: false, title: 'Docker Compose', description: 'Manage Docker Compose stacks' },
  },
  { path: '/mosHub', component: mosHub, props: (route) => ({ hubType: route.query.hubType || '' }), meta: { hideAppBar: false, title: 'MOS Hub', description: 'Manage MOS Hub' } },
  { path: '/lxc', component: Lxc, meta: { hideAppBar: false, title: 'LXC', description: 'Manage LXC containers' } },
  { path: '/lxc/backups/:lxc', component: LxcBackups, props: true, meta: { hideAppBar: false, title: 'LXC Backups', description: 'Manage LXC backups' } },
  { path: '/vm', component: Vm, meta: { hideAppBar: false, title: 'VM', description: 'Manage virtual machines' } },
  { path: '/mosTools', component: mosTools, meta: { hideAppBar: false, title: 'MOS Tools', description: 'Manage MOS tools' } },
  { path: '/mosTools/webterminal', component: mosToolsWebterminal, meta: { hideAppBar: false, title: 'Web Terminal', description: 'Access the web terminal' } },
  { path: '/mosTools/filebrowser', component: mosToolsFilebrowser, meta: { hideAppBar: false, title: 'File Browser', description: 'Browse files' } },
  { path: '/mosSettings', component: mosSettings, meta: { hideAppBar: false, title: 'MOS Settings', description: 'Manage MOS settings' } },
  { path: '/mosSettings/docker', component: mosSettingsDocker, meta: { hideAppBar: false, title: 'MOS Settings - Docker', description: 'Manage Docker settings' } },
  { path: '/mosSettings/lxc', component: mosSettingsLXC, meta: { hideAppBar: false, title: 'MOS Settings - LXC', description: 'Manage LXC settings' } },
  { path: '/mosSettings/vm', component: mosSettingsVm, meta: { hideAppBar: false, title: 'MOS Settings - VM', description: 'Manage VM settings' } },
  {
    path: '/mosSettings/networkInterfaces',
    component: mosSettingsNetworkInterfaces,
    meta: { hideAppBar: false, title: 'MOS Settings - Network Interfaces', description: 'Manage Network Interfaces settings' },
  },
  {
    path: '/mosSettings/networkServices',
    component: mosSettingsNetworkServices,
    meta: { hideAppBar: false, title: 'MOS Settings - Network Services', description: 'Manage Network Services settings' },
  },
  { path: '/mosSettings/system', component: mosSettingsSystem, meta: { hideAppBar: false, title: 'MOS Settings - System', description: 'Manage System settings' } },
  { path: '/mosSettings/cron', component: mosSettingsCron, meta: { hideAppBar: false, title: 'MOS Settings - Cron', description: 'Manage Cron jobs' } },
  { path: '/mosSettings/logs', component: mosSettingsLogs, meta: { hideAppBar: false, title: 'MOS Settings - Logs', description: 'View system logs' } },
  { path: '/mosSettings/drivers', component: mosSettingsDrivers, meta: { hideAppBar: false, title: 'MOS Settings - Drivers', description: 'Manage device drivers' } },
  { path: '/mosSettings/boot', component: mosSettingsBoot, meta: { hideAppBar: false, title: 'MOS Settings - Boot', description: 'Manage boot settings' } },
  { path: '/mosSettings/mosHub', component: mosSettingsHub, meta: { hideAppBar: false, title: 'MOS Settings - MOS Hub', description: 'Manage MOS Hub settings' } },
  { path: '/mosSettings/sensors', component: mosSettingsSensors, meta: { hideAppBar: false, title: 'MOS Settings - Sensors', description: 'Manage system sensors' } },
  { path: '/mosSettings/zram', component: mosSettingsZram, meta: { hideAppBar: false, title: 'MOS Settings - ZRAM', description: 'Manage ZRAM settings' } },
  { path: '/mosSettings/token', component: mosSettingsToken, meta: { hideAppBar: false, title: 'MOS Settings - Token', description: 'Manage API token' } },
  { path: '/mosSettings/users', component: mosSettingsUsers, meta: { hideAppBar: false, title: 'MOS Settings - Users', description: 'Manage users' } },
  { path: '/mosSettings/usbDevices', component: mosSettingsUsbDevices, meta: { hideAppBar: false, title: 'MOS Settings - USB Devices', description: 'Manage USB devices' } },
  { path: '/mosSettings/pciDevices', component: mosSettingsPciDevices, meta: { hideAppBar: false, title: 'MOS Settings - PCI Devices', description: 'Manage PCI devices' } },
  { path: '/mosSettings/smart', component: mosSettingsSmart, meta: { hideAppBar: false, title: 'MOS Settings - SMART', description: 'Manage SMART settings' } },
  { path: '/mosSettings/notifications', component: mosSettingsNotifications, meta: { hideAppBar: false, title: 'MOS Settings - Notifications', description: 'Manage notification settings' } },
  { path: '/profile', component: profile, meta: { hideAppBar: false, title: 'Profile', description: 'Manage your profile' } },
  {
    path: '/webTerminalPopup',
    component: webterminalPopup,
    children: [{ path: '', component: webterminalPopup, meta: { hideAppBar: true, title: 'Web Terminal', description: 'Access the web terminal' } }],
  },
  { path: '/notifications', component: Notifications, meta: { hideAppBar: false, title: 'Notifications', description: 'View your notifications' } },
  { path: '/plugins', component: Plugins, meta: { hideAppBar: false, title: 'Plugins', description: 'Manage installed plugins' } },
  {
    path: '/plugins/:pluginName',
    component: PluginView,
    props: true,
    meta: { hideAppBar: false, title: 'Plugin', description: 'Plugin view' },
  },
  { path: '/mfa', component: Mfa, meta: { hideAppBar: true, title: 'MFA', description: 'Multi-factor authentication' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { title, description } = to.meta || {};
  const defaultTitle = 'MOS';
  const defaultDescription = 'MOS - Modern Operating System for your home server';

  //  document.title = title || defaultTitle;

  const descriptionElement = document.querySelector('head meta[name="description"]');

  if (descriptionElement) {
    descriptionElement.setAttribute('content', description || defaultDescription);
  } else {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = description || defaultDescription;
    document.head.appendChild(meta);
  }

  return true;
});

export default router;
