import { app, BrowserWindow, ipcMain, session, Menu } from 'electron';
import { join } from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#fbfbfd',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // 窗口准备好后显示，避免白屏闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 开发环境加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
  }

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 阻止所有新窗口，可以在这里添加白名单逻辑
    if (url.startsWith('http://') || url.startsWith('https://')) {
      import('electron').then(({ shell }) => {
        shell.openExternal(url);
      });
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  // 设置 CSP
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["script-src 'self' 'unsafe-inline'"]
      }
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 注册基本的 IPC 处理器
  ipcMain.handle('ping', () => 'pong');

  // 获取应用版本
  ipcMain.handle('get-app-version', () => app.getVersion());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理意外退出
process.on('exit', () => {
  console.log('[Main] Node 进程退出');
});
