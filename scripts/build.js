const Path = require('path');
const Chalk = require('chalk');
const FileSystem = require('fs');
const Vite = require('vite');
const { execSync } = require('child_process');

// 设置生产环境变量
process.env.NODE_ENV = 'production';

function buildRenderer() {
    return Vite.build({
        configFile: Path.join(__dirname, '..', 'vite.config.ts'),
        base: './',
        mode: 'production'
    });
}

function buildMain() {
    const mainPath = Path.join(__dirname, '..', 'src', 'main');
    const tsconfigPath = Path.join(mainPath, 'tsconfig.json');
    // Use node to run tsc for cross-platform compatibility
    const tscJs = Path.join(__dirname, '..', 'node_modules', 'typescript', 'bin', 'tsc');
    const tsc = process.execPath; // node executable
    const args = [
        tscJs,
        '--project', tsconfigPath,
        '--outDir', Path.join(__dirname, '..', 'build', 'main'),
        '--module', 'commonjs',
        '--target', 'ES2015'
    ];

    return new Promise((resolve, reject) => {
        const proc = require('child_process').spawn(tsc, args, {
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

// 清理 build 目录
FileSystem.rmSync(Path.join(__dirname, '..', 'build'), {
    recursive: true,
    force: true,
});

console.log(Chalk.blueBright('Transpiling renderer & main...'));

Promise.allSettled([
    buildRenderer(),
    buildMain(),
]).then((results) => {
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length > 0) {
        console.error(Chalk.red('Build failed:'));
        failed.forEach((f, i) => {
            console.error(Chalk.red(`  ${i + 1}. ${f.reason}`));
        });
        process.exit(1);
    }

    console.log(Chalk.greenBright('Renderer & main successfully transpiled!'));
    console.log(Chalk.greenBright('Build complete! (ready for electron-builder)'));
});
