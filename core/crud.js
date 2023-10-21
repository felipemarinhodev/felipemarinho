const fs = require("fs");
const DB_FILE_PATH = "./core/db";
console.log('[CRUD]');

function create(content) {
  // salvar o content no sistema
  fs.writeFileSync(DB_FILE_PATH, content)
  return content;
}


// [SIMULATIONS]
console.log(create("Hoje estou gravando a aula a2.1!"));
