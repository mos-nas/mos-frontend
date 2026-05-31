import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '', component: () => import('../views/dashboard.vue'), meta: { hideAppBar: false, title: 'Dashboard', description: 'Dashboard for your server' } },
  { path: '/login', component: () => import('../views/login.vue'), meta: { hideAppBar: false, title: 'MOS Login', description: 'Login to your server' } },
  { path: '/firstSetup', component: () => import('../views/firstSetup.vue'), props: true, meta: { hideAppBar: false, title: 'MOS First Setup', description: 'Set up your server for the first time' } },
  { path: '/dashboard', component: () => import('../views/dashboard.vue'), meta: { hideAppBar: false, title: 'Dashboard', description: 'Dashboard for your server' } },
  { path: '/pools', component: () => import('../views/pools.vue'), meta: { hideAppBar: false, title: 'Pools', description: 'Manage storage pools' } },
  { path: '/disks', component: () => import('../views/disks.vue'), meta: { hideAppBar: false, title: 'Disks', description: 'Manage disks in your server' } },
  { path: '/shares', component: () => import('../views/shares.vue'), meta: { hideAppBar: false, title: 'Shares', description: 'Manage shares in your server' } },
  { path: '/remoteMounting', component: () => import('../views/remoteMounting.vue'), meta: { hideAppBar: false, title: 'Remote Mounting', description: 'Manage remote mounting' } },
  { path: '/docker', component: () => import('../views/docker.vue'), meta: { hideAppBar: false, title: 'Docker', description: 'Manage Docker containers' } },
  {
    path: '/docker/create',
    component: () => import('../views/docker/dockerCreate.vue'),
    props: (route) => ({
      template: route.query.template || '',
    }),
    meta: { hideAppBar: false, title: 'Create Docker', description: 'Create a new Docker container' },
  },
  {
    path: '/docker/change/:docker',
    component: () => import('../views/docker/dockerChange.vue'),
    props: true,
    meta: { hideAppBar: false, title: 'Change Docker', description: 'Change Docker container settings' },
  },
  {
    path: '/docker/compose',
    component: () => import('../views/docker/dockerCompose.vue'),
    props: (route) => ({ template: route.query.template || '', yaml: route.query.yaml || '', env: route.query.env || '' }),
    meta: { hideAppBar: false, title: 'Docker Compose', description: 'Manage Docker Compose stacks' },
  },
  {
    path: '/mosHub',
    component: () => import('../views/mosHub.vue'),
    props: (route) => ({ hubType: route.query.hubType || '' }),
    meta: { hideAppBar: false, title: 'MOS Hub', description: 'Manage MOS Hub' },
  },
  { path: '/lxc', component: () => import('../views/lxc.vue'), meta: { hideAppBar: false, title: 'LXC', description: 'Manage LXC containers' } },
  { path: '/lxc/backups/:lxc', component: () => import('../views/lxc/lxcBackups.vue'), props: true, meta: { hideAppBar: false, title: 'LXC Backups', description: 'Manage LXC backups' } },
  { path: '/vm', component: () => import('../views/vm.vue'), meta: { hideAppBar: false, title: 'VM', description: 'Manage virtual machines' } },
  { path: '/mosTools', component: () => import('../views/mosTools.vue'), meta: { hideAppBar: false, title: 'MOS Tools', description: 'Manage MOS tools' } },
  { path: '/mosTools/webterminal', component: () => import('../views/mosTools/webterminal.vue'), meta: { hideAppBar: false, title: 'Web Terminal', description: 'Access the web terminal' } },
  { path: '/mosTools/filebrowser', component: () => import('../views/mosTools/filebrowser.vue'), meta: { hideAppBar: false, title: 'File Browser', description: 'Browse files' } },
  { path: '/mosSettings', component: () => import('../views/mosSettings.vue'), meta: { hideAppBar: false, title: 'MOS Settings', description: 'Manage MOS settings' } },
  {
    path: '/mosSettings/docker',
    component: () => import('../views/mosSettings/dockerService.vue'),
    meta: { hideAppBar: false, title: 'MOS Settings - Docker', description: 'Manage Docker settings' },
  },
  { path: '/mosSettings/lxc', component: () => import('../views/mosSettings/lxcService.vue'), meta: { hideAppBar: false, title: 'MOS Settings - LXC', description: 'Manage LXC settings' } },
  { path: '/mosSettings/vm', component: () => import('../views/mosSettings/vmService.vue'), meta: { hideAppBar: false, title: 'MOS Settings - VM', description: 'Manage VM settings' } },
  {
    path: '/mosSettings/networkInterfaces',
    component: () => import('../views/mosSettings/networkInterfaces.vue'),
    meta: { hideAppBar: false, title: 'MOS Settings - Network Interfaces', description: 'Manage Network Interfaces settings' },
  },
  {
    path: '/mosSettings/networkServices',
    component: () => import('../views/mosSettings/networkServices.vue'),
    meta: { hideAppBar: false, title: 'MOS Settings - Network Services', description: 'Manage Network Services settings' },
  },
  { path: '/mosSettings/iscsiTargets', component: () => import('../views/mosSettings/iscsiTargets.vue'), meta: { hideAppBar: false, title: 'MOS Settings - iSCSI Targets', description: 'Manage iSCSI targets' } },
  { path: '/mosSettings/iscsiInitiators', component: () => import('../views/mosSettings/iscsiInitiators.vue'), meta: { hideAppBar: false, title: 'MOS Settings - iSCSI Initiators', description: 'Manage iSCSI initiators' } },
  { path: '/mosSettings/system', component: () => import('../views/mosSettings/system.vue'), meta: { hideAppBar: false, title: 'MOS Settings - System', description: 'Manage System settings' } },
  { path: '/mosSettings/cron', component: () => import('../views/mosSettings/cron.vue'), meta: { hideAppBar: false, title: 'MOS Settings - Cron', description: 'Manage Cron jobs' } },
  { path: '/mosSettings/logs', component: () => import('../views/mosSettings/logs.vue'), meta: { hideAppBar: false, title: 'MOS Settings - Logs', description: 'View system logs' } },
  { path: '/mosSettings/drivers', component: () => import('../views/mosSettings/drivers.vue'), meta: { hideAppBar: false, title: 'MOS Settings - Drivers', description: 'Manage device drivers' } },
  { path: '/mosSettings/boot', component: () => import('../views/mosSettings/boot.vue'), meta: { hideAppBar: false, title: 'MOS Settings - Boot', description: 'Manage boot settings' } },
  { path: '/mosSettings/mosHub', component: () => import('../views/mosSettings/mosHub.vue'), meta: { hideAppBar: false, title: 'MOS Settings - MOS Hub', description: 'Manage MOS Hub settings' } },
  { path: '/mosSettings/sensors', component: () => import('../views/mosSettings/sensors.vue'), meta: { hideAppBar: false, title: 'MOS Settings - Sensors', description: 'Manage system sensors' } },
  { path: '/mosSettings/zram', component: () => import('../views/mosSettings/zram.vue'), meta: { hideAppBar: false, title: 'MOS Settings - ZRAM', description: 'Manage ZRAM settings' } },
  { path: '/mosSettings/token', component: () => import('../views/mosSettings/token.vue'), meta: { hideAppBar: false, title: 'MOS Settings - Token', description: 'Manage API token' } },
  { path: '/mosSettings/users', component: () => import('../views/mosSettings/users.vue'), meta: { hideAppBar: false, title: 'MOS Settings - Users', description: 'Manage users' } },
  {
    path: '/mosSettings/usbDevices',
    component: () => import('../views/mosSettings/usbDevices.vue'),
    meta: { hideAppBar: false, title: 'MOS Settings - USB Devices', description: 'Manage USB devices' },
  },
  {
    path: '/mosSettings/pciDevices',
    component: () => import('../views/mosSettings/pciDevices.vue'),
    meta: { hideAppBar: false, title: 'MOS Settings - PCI Devices', description: 'Manage PCI devices' },
  },
  { path: '/mosSettings/smart', component: () => import('../views/mosSettings/smart.vue'), meta: { hideAppBar: false, title: 'MOS Settings - SMART', description: 'Manage SMART settings' } },
  {
    path: '/mosSettings/notifications',
    component: () => import('../views/mosSettings/notifications.vue'),
    meta: { hideAppBar: false, title: 'MOS Settings - Notifications', description: 'Manage notification settings' },
  },
  { path: '/profile', component: () => import('../views/profile.vue'), meta: { hideAppBar: false, title: 'Profile', description: 'Manage your profile' } },
  {
    path: '/webTerminalPopup',
    component: () => import('../views/webterminalPopup.vue'),
    children: [{ path: '', component: () => import('../views/webterminalPopup.vue'), meta: { hideAppBar: true, title: 'Web Terminal', description: 'Access the web terminal' } }],
  },
  { path: '/notifications', component: () => import('../views/notifications.vue'), meta: { hideAppBar: false, title: 'Notifications', description: 'View your notifications' } },
  { path: '/plugins', component: () => import('../views/plugins.vue'), meta: { hideAppBar: false, title: 'Plugins', description: 'Manage installed plugins' } },
  {
    path: '/plugins/:pluginName',
    component: () => import('../views/pluginView.vue'),
    props: true,
    meta: { hideAppBar: false, title: 'Plugin', description: 'Plugin view' },
  },
  { path: '/mfa', component: () => import('../views/mfa.vue'), meta: { hideAppBar: true, title: 'MFA', description: 'Multi-factor authentication' } },
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
