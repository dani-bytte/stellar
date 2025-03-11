import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Diretórios para mover para src/
const dirsToMove = [
  'app',
  'components',
  'hooks',
  'lib',
  'utils',
  'types',
  'config',
];

// Cria a pasta src se não existir
if (!fs.existsSync(path.join(process.cwd(), 'src'))) {
  fs.mkdirSync(path.join(process.cwd(), 'src'));
  console.log('✅ Pasta src/ criada');
}

/**
 * Remove um diretório recursivamente
 */
function removeDirRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  if (fs.statSync(dirPath).isDirectory()) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.statSync(curPath).isDirectory()) {
        // Recursivamente remove subdiretórios
        removeDirRecursive(curPath);
      } else {
        // Remove arquivos
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

/**
 * Copia e remove diretório (mover efetivamente)
 */
function moveDirectory(srcPath, destPath) {
  if (!fs.existsSync(srcPath)) {
    console.log(`⚠️ Diretório ${srcPath} não encontrado, pulando...`);
    return false;
  }

  // Criamos o diretório de destino se não existir
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  let success = false;

  try {
    // No Windows, tentamos robocopy primeiro
    if (process.platform === 'win32') {
      try {
        // Robocopy tem códigos de saída especiais:
        // 0-7 são considerados sucesso com diferentes níveis de informação
        const result = execSync(`robocopy "${srcPath}" "${destPath}" /E /MIR`, {
          stdio: 'pipe',
          encoding: 'utf8',
        });
        console.log(
          `✅ Copiado ${path.basename(srcPath)}/ para src/${path.basename(srcPath)}/`
        );
        success = true;
      } catch (error) {
        // Robocopy retorna códigos diferentes de 0 mesmo em caso de sucesso
        // Códigos < 8 são sucessos
        if (error.status < 8) {
          console.log(
            `✅ Copiado ${path.basename(srcPath)}/ para src/${path.basename(srcPath)}/`
          );
          success = true;
        } else {
          console.log(`⚠️ Falha no robocopy, tentando método alternativo...`);

          // Método alternativo: xcopy
          try {
            execSync(`xcopy "${srcPath}" "${destPath}" /E /I /H /Y`, {
              stdio: 'pipe',
            });
            console.log(
              `✅ Copiado ${path.basename(srcPath)}/ para src/${path.basename(srcPath)}/ usando xcopy`
            );
            success = true;
          } catch (xcopyError) {
            // Falha no xcopy também, usando cópia manual
            console.log(`⚠️ Falha no xcopy, usando método de cópia manual...`);
            success = copyDirectoryManual(srcPath, destPath);
          }
        }
      }
    } else {
      // No Unix/Linux, usamos cp -r
      execSync(`cp -r "${srcPath}/"* "${destPath}"`);
      console.log(
        `✅ Copiado ${path.basename(srcPath)}/ para src/${path.basename(srcPath)}/`
      );
      success = true;
    }

    // Se a cópia foi bem-sucedida, removemos o diretório original
    if (success) {
      console.log(
        `🗑️ Removendo diretório original ${path.basename(srcPath)}/...`
      );
      removeDirRecursive(srcPath);
      console.log(
        `✅ ${path.basename(srcPath)}/ movido para src/${path.basename(srcPath)}/`
      );
    }

    return success;
  } catch (error) {
    console.error(`❌ Erro ao mover ${path.basename(srcPath)}:`, error.message);
    return false;
  }
}

/**
 * Método manual para copiar diretórios quando os comandos do sistema falham
 */
function copyDirectoryManual(source, destination) {
  try {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source);

    for (const file of files) {
      const srcFilePath = path.join(source, file);
      const destFilePath = path.join(destination, file);

      if (fs.statSync(srcFilePath).isDirectory()) {
        copyDirectoryManual(srcFilePath, destFilePath);
      } else {
        fs.copyFileSync(srcFilePath, destFilePath);
      }
    }

    return true;
  } catch (err) {
    console.error(`❌ Erro na cópia manual: ${err.message}`);
    return false;
  }
}

// Move cada diretório para src/
let movedCount = 0;
dirsToMove.forEach((dir) => {
  const srcPath = path.join(process.cwd(), dir);
  const destPath = path.join(process.cwd(), 'src', dir);

  if (fs.existsSync(srcPath)) {
    if (moveDirectory(srcPath, destPath)) {
      movedCount++;
    }
  } else {
    console.log(`⚠️ Diretório ${dir}/ não encontrado, pulando...`);
  }
});

console.log(
  `\n🎉 Migração para estrutura src/ concluída! ${movedCount}/${dirsToMove.length} diretórios movidos.`
);
console.log(
  '\nAtualize seu tsconfig.json e next.config.js conforme necessário.'
);

// Verifica se ainda existem diretórios originais e alerta
const remainingDirs = dirsToMove.filter((dir) =>
  fs.existsSync(path.join(process.cwd(), dir))
);
if (remainingDirs.length > 0) {
  console.log(
    '\n⚠️ Aviso: Os seguintes diretórios ainda existem na raiz e podem conter duplicatas:'
  );
  remainingDirs.forEach((dir) => console.log(`- ${dir}/`));
  console.log('Considere removê-los manualmente se necessário.');
}
