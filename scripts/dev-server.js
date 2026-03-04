process.env.NODE_ENV = 'development';

const Vite = require('vite');
const ChildProcess = require('child_process');
const Path = require('path');
const Chalk = require('chalk');
const Chokidar = require('chokidar');
const Electron = require('electron');
const FileSystem = require('fs');
const { EOL } = require('os');

let viteServer = null;
let electronProcess = null;
let electronProcessLocker = false;
let rendererPort = 0;

async function startRenderer() {
    viteServer = await Vite.createServer({
        configFile: Path.join(__dirname, '..', 'vite.config.ts'),
        mode: 'development',
    });

    return viteServer.listen();
}

async function startElectron() {
    if (electronProcess) { // single instance lock
        return;
    }

    try {
        await compileTs(Path.join(__dirname, '..', 'src', 'main'));
    } catch (err) {
        console.log(Chalk.redBright('Could not start Electron because of the above typescript error(s).'));
        console.error(err);
        electronProcessLocker = false;
        return;
    }

    const args = [
        Path.join(__dirname, '..', 'build', 'main', 'main.js'),
        rendererPort,
    ];
    electronProcess = ChildProcess.spawn(Electron, args);
    electronProcessLocker = false;

    electronProcess.stdout.on('data', data => {
        if (data == EOL) {
            return;
        }

        process.stdout.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString()))
    });

    electronProcess.stderr.on('data', data =>
        process.stderr.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString()))
    );

    electronProcess.on('exit', () => stop());
}

function restartElectron() {
    if (electronProcess) {
        electronProcess.removeAllListeners('exit');
        electronProcess.kill();
        electronProcess = null;
    }

    if (!electronProcessLocker) {
        electronProcessLocker = true;
        startElectron();
    }
}

function copyStaticFiles() {
    const staticPath = Path.join(__dirname, '..', 'src', 'main', 'static');
    if (FileSystem.existsSync(staticPath)) {
        copy('static');
    }
}

function copy(path) {
    const srcPath = Path.join(__dirname, '..', 'src', 'main', path);
    const destPath = Path.join(__dirname, '..', 'build', 'main', path);

    if (FileSystem.existsSync(srcPath)) {
        FileSystem.cpSync(srcPath, destPath, { recursive: true, force: true });
    }
}

function stop() {
    if (viteServer) {
        viteServer.close();
    }
    process.exit();
}

async function compileTs(cwd) {
    return new Promise((resolve, reject) => {
        const tsconfigPath = Path.join(cwd, 'tsconfig.json');
        const tsc = Path.join(__dirname, '..', 'node_modules', '.bin', 'tsc');

        const args = [
            '--project', tsconfigPath,
            '--outDir', Path.join(__dirname, '..', 'build', 'main'),
            '--module', 'commonjs',
            '--target', 'ES2015'
        ];

        const proc = ChildProcess.spawn(tsc, args, {
            cwd: process.cwd(),
            stdio: 'pipe'
        });

        let stderr = '';
        proc.stderr.on('data', data => {
            stderr += data.toString();
            process.stderr.write(Chalk.blueBright(`[tsc] `) + Chalk.white(data.toString()));
        });

        proc.stdout.on('data', data => {
            process.stdout.write(Chalk.blueBright(`[tsc] `) + Chalk.white(data.toString()));
        });

        proc.on('close', code => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`TypeScript compilation failed with code ${code}\n${stderr}`));
            }
        });
    });
}

async function start() {
    console.log(`${Chalk.greenBright('=======================================')}`);
    console.log(`${Chalk.greenBright('Starting Electron + Vite Dev Server...')}`);
    console.log(`${Chalk.greenBright('=======================================')}`);

    const devServer = await startRenderer();
    rendererPort = devServer.config.server.port;

    copyStaticFiles();
    startElectron();

    const path = Path.join(__dirname, '..', 'src', 'main');
    Chokidar.watch(path, {
        cwd: path,
    }).on('change', (path) => {
        console.log(Chalk.blueBright(`[electron] `) + `Change in ${path}. reloading... 🚀`);

        if (path.startsWith(Path.join('static', '/'))) {
            copy(path);
        }

        restartElectron();
    });
}

start();
