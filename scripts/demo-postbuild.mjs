// GitHub Pages отдаёт 404.html на любой неизвестный адрес. Копия index.html открывает демо
// и на прямых ссылках вроде /veshi/… или /fond. .nojekyll отключает обработку Jekyll.
import { copyFileSync, writeFileSync } from 'node:fs';

copyFileSync('dist-demo/index.html', 'dist-demo/404.html');
writeFileSync('dist-demo/.nojekyll', '');
console.log('dist-demo готов: index.html, 404.html, .nojekyll');
