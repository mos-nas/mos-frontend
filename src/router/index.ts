import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    hideAppBar?: boolean;
    title: string;
    description: string;
  }
}

const routes: RouteRecordRaw[] = [
  { path: '', component: () => import('../views/dashboard.vue'), meta: { title: 'Dashboard', description: 'Dashboard for your server' } },
  { path: '/login', component: () => import('../views/login.vue'), meta: { title: 'MOS Login', description: 'Login to your server' } },
  { path: '/firstSetup', component: () => import('../views/firstSetup.vue'), props: true, meta: { title: 'MOS First Setup', description: 'Set up your server for the first time' } },
  { path: '/dashboard', component: () => import('../views/dashboard.vue'), meta: { title: 'Dashboard', description: 'Dashboard for your server' } },
  { path: '/pools', component: () => import('../views/pools.vue'), meta: { title: 'Pools', description: 'Manage storage pools' } },
  { path: '/disks', component: () => import('../views/disks.vue'), meta: { title: 'Disks', description: 'Manage disks in your server' } },
  { path: '/shares', component: () => import('../views/shares.vue'), meta: { title: 'Shares', description: 'Manage shares in your server' } },
  { path: '/remoteMounting', component: () => import('../views/remoteMounting.vue'), meta: { title: 'Remote Mounting', description: 'Manage remote mounting' } },
  { path: '/docker', component: () => import('../views/docker.vue'), meta: { title: 'Docker', description: 'Manage Docker containers' } },
  {
    path: '/docker/create',
    component: () => import('../views/docker/dockerCreate.vue'),
    props: (route) => ({
      template: route.query.template || '',
    }),
    meta: { title: 'Create Docker', description: 'Create a new Docker container' },
  },
  {
    path: '/docker/change/:docker',
    component: () => import('../views/docker/dockerChange.vue'),
    props: true,
    meta: { title: 'Change Docker', description: 'Change Docker container settings' },
  },
  {
    path: '/docker/compose',
    component: () => import('../views/docker/dockerCompose.vue'),
    props: (route) => ({ template: route.query.template || '', yaml: route.query.yaml || '', env: route.query.env || '' }),
    meta: { title: 'Docker Compose', description: 'Manage Docker Compose stacks' },
  },
  {
    path: '/mosHub',
    component: () => import('../views/mosHub.vue'),
    props: (route) => ({ hubType: route.query.hubType || '' }),
    meta: { title: 'MOS Hub', description: 'Manage MOS Hub' },
  },
  { path: '/lxc', component: () => import('../views/lxc.vue'), meta: { title: 'LXC', description: 'Manage LXC containers' } },
  { path: '/lxc/backups/:lxc', component: () => import('../views/lxc/lxcBackups.vue'), props: true, meta: { title: 'LXC Backups', description: 'Manage LXC backups' } },
  { path: '/vm', component: () => import('../views/vm.vue'), meta: { title: 'VM', description: 'Manage virtual machines' } },
  { path: '/mosTools', component: () => import('../views/mosTools.vue'), meta: { title: 'MOS Tools', description: 'Manage MOS tools' } },
  { path: '/mosTools/webterminal', component: () => import('../views/mosTools/webterminal.vue'), meta: { title: 'Web Terminal', description: 'Access the web terminal' } },
  { path: '/mosTools/filebrowser', component: () => import('../views/mosTools/filebrowser.vue'), meta: { title: 'File Browser', description: 'Browse files' } },
  { path: '/mosSettings', component: () => import('../views/mosSettings.vue'), meta: { title: 'MOS Settings', description: 'Manage MOS settings' } },
  {
    path: '/mosSettings/docker',
    component: () => import('../views/mosSettings/dockerService.vue'),
    meta: { title: 'MOS Settings - Docker', description: 'Manage Docker settings' },
  },
  { path: '/mosSettings/lxc', component: () => import('../views/mosSettings/lxcService.vue'), meta: { title: 'MOS Settings - LXC', description: 'Manage LXC settings' } },
  { path: '/mosSettings/vm', component: () => import('../views/mosSettings/vmService.vue'), meta: { title: 'MOS Settings - VM', description: 'Manage VM settings' } },
  {
    path: '/mosSettings/networkInterfaces',
    component: () => import('../views/mosSettings/networkInterfaces.vue'),
    meta: { title: 'MOS Settings - Network Interfaces', description: 'Manage Network Interfaces settings' },
  },
  {
    path: '/mosSettings/networkServices',
    component: () => import('../views/mosSettings/networkServices.vue'),
    meta: { title: 'MOS Settings - Network Services', description: 'Manage Network Services settings' },
  },
  {
    path: '/mosSettings/iscsiTargets',
    component: () => import('../views/mosSettings/iscsiTargets.vue'),
    meta: { title: 'MOS Settings - iSCSI Targets', description: 'Manage iSCSI targets' },
  },
  {
    path: '/mosSettings/iscsiInitiators',
    component: () => import('../views/mosSettings/iscsiInitiators.vue'),
    meta: { title: 'MOS Settings - iSCSI Initiators', description: 'Manage iSCSI initiators' },
  },
  { path: '/mosSettings/system', component: () => import('../views/mosSettings/system.vue'), meta: { title: 'MOS Settings - System', description: 'Manage System settings' } },
  { path: '/mosSettings/cron', component: () => import('../views/mosSettings/cron.vue'), meta: { title: 'MOS Settings - Cron', description: 'Manage Cron jobs' } },
  { path: '/mosSettings/logs', component: () => import('../views/mosSettings/logs.vue'), meta: { title: 'MOS Settings - Logs', description: 'View system logs' } },
  { path: '/mosSettings/drivers', component: () => import('../views/mosSettings/drivers.vue'), meta: { title: 'MOS Settings - Drivers', description: 'Manage device drivers' } },
  { path: '/mosSettings/boot', component: () => import('../views/mosSettings/boot.vue'), meta: { title: 'MOS Settings - Boot', description: 'Manage boot settings' } },
  { path: '/mosSettings/mosHub', component: () => import('../views/mosSettings/mosHub.vue'), meta: { title: 'MOS Settings - MOS Hub', description: 'Manage MOS Hub settings' } },
  { path: '/mosSettings/sensors', component: () => import('../views/mosSettings/sensors.vue'), meta: { title: 'MOS Settings - Sensors', description: 'Manage system sensors' } },
  { path: '/mosSettings/zram', component: () => import('../views/mosSettings/zram.vue'), meta: { title: 'MOS Settings - ZRAM', description: 'Manage ZRAM settings' } },
  { path: '/mosSettings/token', component: () => import('../views/mosSettings/token.vue'), meta: { title: 'MOS Settings - Token', description: 'Manage API token' } },
  { path: '/mosSettings/users', component: () => import('../views/mosSettings/users.vue'), meta: { title: 'MOS Settings - Users', description: 'Manage users' } },
  {
    path: '/mosSettings/usbDevices',
    component: () => import('../views/mosSettings/usbDevices.vue'),
    meta: { title: 'MOS Settings - USB Devices', description: 'Manage USB devices' },
  },
  {
    path: '/mosSettings/pciDevices',
    component: () => import('../views/mosSettings/pciDevices.vue'),
    meta: { title: 'MOS Settings - PCI Devices', description: 'Manage PCI devices' },
  },
  { path: '/mosSettings/smart', component: () => import('../views/mosSettings/smart.vue'), meta: { title: 'MOS Settings - SMART', description: 'Manage SMART settings' } },
  {
    path: '/mosSettings/notifications',
    component: () => import('../views/mosSettings/notifications.vue'),
    meta: { title: 'MOS Settings - Notifications', description: 'Manage notification settings' },
  },
  { path: '/profile', component: () => import('../views/profile.vue'), meta: { title: 'Profile', description: 'Manage your profile' } },
  {
    path: '/webTerminalPopup',
    component: () => import('../views/webterminalPopup.vue'),
    children: [{ path: '', component: () => import('../views/webterminalPopup.vue'), meta: { hideAppBar: true, title: 'Web Terminal', description: 'Access the web terminal' } }],
  },
  { path: '/notifications', component: () => import('../views/notifications.vue'), meta: { title: 'Notifications', description: 'View your notifications' } },
  { path: '/plugins', component: () => import('../views/plugins.vue'), meta: { title: 'Plugins', description: 'Manage installed plugins' } },
  {
    path: '/plugins/:pluginName',
    component: () => import('../views/pluginView.vue'),
    props: true,
    meta: { title: 'Plugin', description: 'Plugin view' },
  },
  { path: '/mfa', component: () => import('../views/mfa.vue'), meta: { hideAppBar: true, title: 'MFA', description: 'Multi-factor authentication' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const { description } = to.meta;
  const defaultDescription = 'MOS - Modern Operating System for your home server';

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
